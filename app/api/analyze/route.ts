import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BOT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; PageInspectorBot/1.0; +https://www.page-inspector.com)",
};

async function fetchText(url: string, timeoutMs = 8000): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: BOT_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function extractSitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);
}

async function discoverSitemapUrls(baseUrl: string): Promise<string[]> {
  let origin: string;

  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }

  const robots = await fetchText(`${origin}/robots.txt`);
  const sitemapMatch = robots.match(/Sitemap:\s*(\S+)/i);

  const candidates = [
    sitemapMatch?.[1],
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const xml = await fetchText(candidate);

    if (xml && xml.includes("<loc>")) {
      let urls = extractSitemapUrls(xml);

      if (xml.includes("<sitemapindex")) {
        const nested: string[] = [];

        for (const subSitemap of urls.slice(0, 3)) {
          const subXml = await fetchText(subSitemap);
          nested.push(...extractSitemapUrls(subXml));
        }

        urls = nested;
      }

      return urls;
    }
  }

  return [];
}

function extractPageSummary(html: string, url: string): string {
  if (!html) {
    return `\n--- PAGE: ${url} ---\n(Could not be fetched — may block bots or require JavaScript.)\n`;
  }

  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "(none)";

  const metaDescription =
    html.match(
      /<meta\s+[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i
    )?.[1]?.trim() ||
    html.match(
      /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i
    )?.[1]?.trim() ||
    "(none)";

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .slice(0, 6);

  const imgCount = (html.match(/<img\b/gi) || []).length;
  const imgWithoutAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;

  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);

  return `
--- PAGE: ${url} ---
Title tag: ${title}
Meta description: ${metaDescription}
H1 headings: ${h1s.join(" | ") || "(none found)"}
H2 headings: ${h2s.join(" | ") || "(none found)"}
Images: ${imgCount} total, ${imgWithoutAlt} missing alt text
Visible text sample: ${bodyText}
`;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    let origin: string;
    try {
      origin = new URL(url).origin;
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid URL, including https://" },
        { status: 400 }
      );
    }

    const homepageHtml = await fetchText(url);
    const sitemapUrls = await discoverSitemapUrls(url);

    const additionalUrls = sitemapUrls
      .filter((u) => {
        try {
          const parsed = new URL(u);
          return (
            parsed.origin === origin &&
            !/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|xml)$/i.test(parsed.pathname)
          );
        } catch {
          return false;
        }
      })
      .filter((u) => u.replace(/\/$/, "") !== url.replace(/\/$/, ""))
      .slice(0, 5);

    const additionalPages = await Promise.all(
      additionalUrls.map(async (pageUrl) => ({
        url: pageUrl,
        html: await fetchText(pageUrl),
      }))
    );

    const allPages = [{ url, html: homepageHtml }, ...additionalPages].filter(
      (p) => p.html
    );

    const siteContext = allPages
      .map((p) => extractPageSummary(p.html, p.url))
      .join("\n");

    const analyzedUrlsList = allPages.map((p) => p.url).join("\n- ");

    const sitemapNote =
      sitemapUrls.length > 0
        ? `A sitemap was found with ${sitemapUrls.length} known URLs. ${allPages.length} page(s) were fetched and analyzed in depth (homepage plus the most relevant additional pages).`
        : `No sitemap was found for this domain. Only the homepage could be analyzed — note this as a limitation and, if relevant, flag the missing sitemap as an SEO issue.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      input: `
You are a senior website conversion rate optimization consultant with 15+ years of experience auditing websites for funded startups and established e-commerce brands. You charge $500/hour for audits like this one. Clients pay you specifically because your findings are precise, evidence-based, and immediately actionable — never generic advice that could apply to any website.

You have just crawled the following website using its sitemap to understand its full structure, not just the homepage.

WEBSITE: ${url}

CRAWL NOTE: ${sitemapNote}

PAGES ANALYZED (exact URLs — use these exact URLs in your "pages_analyzed" output, do not invent others):
- ${analyzedUrlsList}

SITE CONTENT (extracted from ${allPages.length} page(s)):
${siteContext.slice(0, 18000)}

---

YOUR TASK

Write a comprehensive, professional website audit report, structured as valid JSON, that reads like a real paid consulting deliverable — long, thorough, and specific, not a quick summary. Every issue and recommendation must reference something concrete you observed in the content above rather than a generic best practice.

TONE
- Professional, direct, and confident — like a consultant delivering findings to a paying client.
- No filler phrases. Get straight to the finding and its business impact.
- Connect findings to business consequences (lost trust, lost conversions, lost search visibility) where possible.

REPORT STRUCTURE
- Write a genuine "introduction" section (4-6 sentences): what site was analyzed, how many pages were reviewed and how (sitemap-based crawl), what the overall approach was, and a preview of the overall verdict.
- Write a "pages_analyzed" array: one entry per URL listed above, each with a 1-2 sentence "note" describing what that specific page is for and anything notable found on it.

CATEGORY SCORES
- Score each of the 6 categories (seo, ux, performance, accessibility, copywriting, conversion) from 0-100 independently. Be honest and differentiate — not everything should score the same.
- The overall "score" should reasonably reflect the average weighted by how much each area affects business outcomes.

DEPTH AND BREADTH — THIS IS THE MOST IMPORTANT PART
- For each of the 6 categories, provide 4 distinct issues (not 2-3) where evidence supports it. Each issue should be a full sentence or two, not a fragment — explain what you found AND why it matters for the business.
- For each category, also provide 3 distinct, concrete recommendation options — genuinely different approaches (a quick tactical fix, a more thorough structural fix, and a longer-term strategic improvement), each explained in 1-2 full sentences, not a short phrase.
- If multiple pages were analyzed, look for cross-page patterns (inconsistent messaging, duplicate title tags, missing meta descriptions site-wide, inconsistent CTAs) and call these out explicitly as their own issues where relevant.
- Cite specifics: reference actual heading text, actual page paths, or actual counts wherever the source content supports it. Do not invent specifics that aren't supported by the content provided — if evidence is limited, say so plainly.
- This report will be sent as a long-form email document. Write with enough substance that each category section feels like a real consulting deliverable — favor thorough, well-explained findings over short bullet fragments.

INDUSTRY BENCHMARKS
- For each category, add a "benchmark" field: 1-2 sentences comparing this site's situation to well-established, general industry standards (e.g., Google's Core Web Vitals thresholds, typical conversion rate ranges for the site's apparent business type, common SEO best-practice baselines, WCAG accessibility standards).
- Use only well-known, generally accepted benchmarks. Do not invent specific competitor names, specific competitor URLs, or specific competitor metrics you cannot know — frame this as general industry context, not a named comparison.
- If you can reasonably infer the business type/vertical from the site content, use that to make the benchmark more specific (e.g., "For SaaS landing pages, typical conversion rates range from 3-5%; for a B2C e-commerce homepage, LCP under 2.5s is considered good by Google's standards").

Return ONLY valid JSON, with no markdown code fences and no commentary outside the JSON. Use exactly this structure:

{
  "score": 85,

  "introduction": "4-6 sentence introduction to the report",

  "pages_analyzed": [
    { "url": "https://example.com", "note": "Homepage — 1-2 sentence note" }
  ],

  "summary": {
    "headline": "One sharp, specific sentence capturing the single biggest opportunity on this site",
    "description": "A 2-3 sentence executive summary — what's working, what's costing them the most, and the overall verdict."
  },

  "preview": {
    "seo": "One specific, concrete SEO finding (not generic)",
    "ux": "One specific, concrete UX finding (not generic)",
    "performance": "One specific, concrete performance finding (not generic)"
  },

  "category_scores": {
    "seo": 70,
    "ux": 65,
    "performance": 55,
    "accessibility": 60,
    "copywriting": 75,
    "conversion": 62
  },

  "seo": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for SEO"
  },

  "ux": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for UX"
  },

  "performance": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for performance (e.g. Core Web Vitals)"
  },

  "accessibility": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for accessibility (e.g. WCAG)"
  },

  "conversion": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for conversion rate for this type of site"
  },

  "copywriting": {
    "issues": ["Full sentence issue 1", "Full sentence issue 2", "Full sentence issue 3", "Full sentence issue 4"],
    "recommendations": ["Full sentence option A", "Full sentence option B", "Full sentence option C"],
    "benchmark": "1-2 sentence comparison to general industry standards for copywriting/messaging clarity"
  },

  "priority_actions": [
    { "priority": "high", "action": "The single highest-leverage fix, stated concretely and explained in 1-2 sentences" },
    { "priority": "medium", "action": "The second most valuable fix, explained in 1-2 sentences" },
    { "priority": "low", "action": "A worthwhile but non-urgent improvement, explained in 1-2 sentences" }
  ]
}

RULES
- Every "issues" entry must be traceable to something in the SITE CONTENT above, or clearly framed as an inference.
- Never say "consider improving your SEO" or similar vague filler — always say what, specifically, and why it matters, in full sentences.
- category_scores must show real variation based on actual findings.
- Never state a specific competitor's name, URL, or metrics as fact — only general, well-established industry benchmarks.
- Return JSON only.
      `,
    });

    console.log("OPENAI RESPONSE:", response.output_text);

    const cleanedOutput = response.output_text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const audit = JSON.parse(cleanedOutput);

    // Varnostna mreža: če model izpusti pages_analyzed, ga zgradimo sami iz dejanskih crawlanih strani
    if (!Array.isArray(audit.pages_analyzed) || audit.pages_analyzed.length === 0) {
      audit.pages_analyzed = allPages.map((p) => ({
        url: p.url,
        note: "Page analyzed as part of this audit.",
      }));
    }

    console.log("NEW AUDIT:", audit);

    const { data, error } = await supabase
      .from("audits")
      .insert({
        website: url,
        score: audit.score,
        report: audit,
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        { error: "Could not save audit." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId: data.id,
      website: url,
      score: audit.score,
      preview: audit.preview,
    });
  } catch (error) {
    console.error("Analyze error:", error);

    return NextResponse.json(
      { error: "The website could not be analyzed." },
      { status: 500 }
    );
  }
}