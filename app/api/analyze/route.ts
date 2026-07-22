import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

      // Sitemap index files point to other sitemap files, not pages directly
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

    // 1. Fetch the homepage
    const homepageHtml = await fetchText(url);

    // 2. Try to discover a real sitemap for this site
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

    // 3. Fetch those extra pages in parallel
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

SITE CONTENT (extracted from ${allPages.length} page(s)):
${siteContext.slice(0, 18000)}

---

YOUR TASK

Write a professional website audit report, structured as valid JSON, that reads like it was produced by a senior consultant who actually reviewed this specific site — not a template. Every issue and recommendation must reference something concrete you observed in the content above (an actual heading, an actual missing element, an actual pattern across pages) rather than a generic best practice.

TONE
- Professional, direct, and confident — like a consultant delivering findings to a paying client, not a chatbot being encouraging.
- No filler phrases ("in today's digital landscape", "it's important to note that"). Get straight to the finding and its business impact.
- Where you can, connect a finding to its business consequence (lost trust, lost conversions, lost search visibility) rather than stating it as an abstract flaw.

DEPTH
- If multiple pages were analyzed, look for patterns and inconsistencies across pages (e.g. inconsistent messaging, duplicate title tags, missing meta descriptions site-wide, inconsistent CTAs) — this cross-page analysis is exactly what makes this audit worth paying for.
- Cite specifics: reference actual heading text, actual page paths, or actual counts (e.g. "3 of the 4 pages reviewed are missing a meta description") wherever the source content supports it. Do not invent specifics that aren't supported by the content provided — if evidence is limited, say so plainly rather than fabricating detail.

Return ONLY valid JSON, with no markdown code fences and no commentary outside the JSON. Use exactly this structure:

{
  "score": 85,

  "summary": {
    "headline": "One sharp, specific sentence capturing the single biggest opportunity on this site",
    "description": "A 2-3 sentence executive summary a business owner would read first — what's working, what's costing them the most, and the overall verdict."
  },

  "preview": {
    "seo": "One specific, concrete SEO finding (not generic)",
    "ux": "One specific, concrete UX finding (not generic)",
    "performance": "One specific, concrete performance finding (not generic)"
  },

  "seo": {
    "issues": ["Specific issue referencing actual content/pages", "Specific issue 2"],
    "recommendations": ["Concrete, actionable fix for issue 1", "Concrete, actionable fix for issue 2"]
  },

  "ux": {
    "issues": ["Specific issue referencing actual content/pages", "Specific issue 2"],
    "recommendations": ["Concrete, actionable fix for issue 1", "Concrete, actionable fix for issue 2"]
  },

  "performance": {
    "issues": ["Specific issue based on what could be observed", "Specific issue 2"],
    "recommendations": ["Concrete, actionable fix for issue 1", "Concrete, actionable fix for issue 2"]
  },

  "conversion": {
    "issues": ["Specific issue referencing actual CTAs/copy/flow observed", "Specific issue 2"],
    "recommendations": ["Concrete, actionable fix for issue 1", "Concrete, actionable fix for issue 2"]
  },

  "copywriting": {
    "issues": ["Specific issue referencing actual headlines/copy observed", "Specific issue 2"],
    "recommendations": ["Concrete, actionable fix for issue 1", "Concrete, actionable fix for issue 2"]
  },

  "priority_actions": [
    { "priority": "high", "action": "The single highest-leverage fix, stated concretely" },
    { "priority": "medium", "action": "The second most valuable fix" },
    { "priority": "low", "action": "A worthwhile but non-urgent improvement" }
  ]
}

RULES
- Every "issues" entry must be traceable to something in the SITE CONTENT above, or clearly framed as an inference (e.g. "could not verify X — recommend manual check").
- Never say "consider improving your SEO" or other vague filler — always say what, specifically, and why it matters.
- If a section legitimately has very little to criticize, say so honestly rather than inventing a weak issue — credibility matters more than filling every field.
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