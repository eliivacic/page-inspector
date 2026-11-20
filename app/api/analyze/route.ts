import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Long-form reports regularly take over a minute to generate
export const maxDuration = 300;

// Reads ANTHROPIC_API_KEY from the environment
const anthropic = new Anthropic();

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

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function metaContent(html: string, attr: "name" | "property", key: string): string {
  const re1 = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*content=["']([\\s\\S]*?)["']`, "i");
  const re2 = new RegExp(`<meta\\s+[^>]*content=["']([\\s\\S]*?)["'][^>]*${attr}=["']${key}["']`, "i");
  return html.match(re1)?.[1]?.trim() || html.match(re2)?.[1]?.trim() || "";
}

function extractPageSummary(html: string, url: string, textLimit: number): string {
  if (!html) {
    return `\n--- PAGE: ${url} ---\n(Could not be fetched — may block bots or require JavaScript.)\n`;
  }

  const title = decodeEntities(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "(none)"
  );
  const metaDescription = decodeEntities(metaContent(html, "name", "description") || "(none)");

  const headings = (tag: string, max: number) =>
    [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
      .map((m) => stripTags(m[1]))
      .filter(Boolean)
      .slice(0, max);

  const h1s = headings("h1", 3);
  const h2s = headings("h2", 12);
  const h3s = headings("h3", 12);

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgWithoutAlt = imgTags.filter((t) => !/\balt=/i.test(t)).length;
  const lazyImages = imgTags.filter((t) => /loading=["']lazy["']/i.test(t)).length;

  const ctas = [...html.matchAll(/<(button|a)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => stripTags(m[2]))
    .filter((t) => t && t.length <= 40);
  const uniqueCtas = [...new Set(ctas)].slice(0, 20);

  const internalLinks = (html.match(/<a\b[^>]*href=["'](\/|#|https?:\/\/[^"']*)/gi) || []).length;
  const forms = (html.match(/<form\b/gi) || []).length;
  const inputs = (html.match(/<input\b/gi) || []).length;
  const labels = (html.match(/<label\b/gi) || []).length;
  const scripts = (html.match(/<script\b/gi) || []).length;
  const stylesheets = (html.match(/<link\b[^>]*rel=["']stylesheet["']/gi) || []).length;

  const lang = html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1] || "(missing)";
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || "(none)";
  const robots = metaContent(html, "name", "robots") || "(none)";
  const viewport = metaContent(html, "name", "viewport") ? "present" : "MISSING";
  const ogTitle = metaContent(html, "property", "og:title") ? "present" : "missing";
  const ogImage = metaContent(html, "property", "og:image") ? "present" : "missing";
  const structuredData = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);

  const bodyText = stripTags(
    html
      .replace(/<head[\s\S]*?<\/head>/i, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
  );

  return `
--- PAGE: ${url} ---
Title tag: ${title} (${title.length} chars)
Meta description: ${metaDescription}
Language attribute: ${lang} · Canonical: ${canonical} · Meta robots: ${robots} · Viewport meta: ${viewport}
Open Graph: title ${ogTitle}, image ${ogImage} · Structured data types: ${[...new Set(structuredData)].join(", ") || "(none)"}
H1 headings: ${h1s.join(" | ") || "(none found)"}
H2 headings: ${h2s.join(" | ") || "(none found)"}
H3 headings: ${h3s.join(" | ") || "(none found)"}
Buttons and link labels: ${uniqueCtas.join(" | ") || "(none found)"}
Images: ${imgTags.length} total, ${imgWithoutAlt} missing alt text, ${lazyImages} lazy-loaded
Links: ${internalLinks} · Forms: ${forms} (${inputs} inputs, ${labels} labels) · Scripts: ${scripts} · Stylesheets: ${stylesheets}
HTML size: ${Math.round(html.length / 1024)} KB
Visible text${bodyText.length > textLimit ? ` (first ${textLimit} of ${bodyText.length} characters)` : ""}: ${bodyText.slice(0, textLimit)}
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
      // The homepage gets the most room; it is where most conversion issues live
      .map((p, i) => extractPageSummary(p.html, p.url, i === 0 ? 9000 : 3500))
      .join("\n");

    const analyzedUrlsList = allPages.map((p) => p.url).join("\n- ");

    const sitemapNote =
      sitemapUrls.length > 0
        ? `A sitemap was found with ${sitemapUrls.length} known URLs. ${allPages.length} page(s) were fetched and analyzed in depth (homepage plus the most relevant additional pages).`
        : `No sitemap was found for this domain. Only the homepage could be analyzed — note this as a limitation and, if relevant, flag the missing sitemap as an SEO issue.`;

    const prompt = `
You are a senior website conversion rate optimization consultant with 15+ years of experience auditing websites for funded startups and established e-commerce brands. You charge $500/hour for audits like this one. Clients pay you specifically because your findings are precise, evidence-based, and immediately actionable — never generic advice that could apply to any website.

You have just crawled the following website using its sitemap to understand its full structure, not just the homepage.

WEBSITE: ${url}

CRAWL NOTE: ${sitemapNote}

PAGES ANALYZED (exact URLs — use these exact URLs in your "pages_analyzed" output, do not invent others):
- ${analyzedUrlsList}

SITE CONTENT (extracted from ${allPages.length} page(s)):
${siteContext.slice(0, 45000)}

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
      `;

    // Streaming keeps the long report clear of HTTP timeouts; fallbacks re-run a
    // safety-declined request on Anthropic's recommended fallback model.
    const message = await anthropic.beta.messages
      .stream({
        model: "claude-opus-5",
        max_tokens: 32000,
        // Low effort keeps the free preview fast (full effort took ~3 min)
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content: prompt }],
      })
      .finalMessage();

    if (message.stop_reason === "refusal" || message.stop_reason === "max_tokens") {
      throw new Error(`Model stopped early: ${message.stop_reason}`);
    }

    const outputText = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    console.log("CLAUDE RESPONSE:", outputText);

    // Tolerate stray prose or code fences around the JSON object
    const jsonStart = outputText.indexOf("{");
    const jsonEnd = outputText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new Error("Model response contained no JSON object");
    }

    const audit = JSON.parse(outputText.slice(jsonStart, jsonEnd + 1));

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