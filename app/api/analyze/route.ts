import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    let html = "";

    try {
      const websiteResponse = await fetch(url);
      html = await websiteResponse.text();
    } catch {
      console.log("Could not fetch website HTML");
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      input: `
You are a senior website conversion rate optimization consultant.

Analyze this website:

URL:
${url}

HTML:
${html.slice(0, 15000)}

Create a professional website audit that a customer would pay for.

Return ONLY valid JSON.

Use exactly this structure:

{
  "score": 85,

  "summary": {
    "headline": "Short powerful conclusion",
    "description": "Business-focused summary"
  },

  "preview": {
    "seo": "Short SEO finding",
    "ux": "Short UX finding",
    "performance": "Short performance finding"
  },

  "seo": {
    "issues": [
      "Issue 1",
      "Issue 2"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ]
  },

  "ux": {
    "issues": [
      "Issue 1",
      "Issue 2"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ]
  },

  "performance": {
    "issues": [
      "Issue 1",
      "Issue 2"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ]
  },

  "conversion": {
    "issues": [
      "Issue 1",
      "Issue 2"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ]
  },

  "copywriting": {
    "issues": [
      "Issue 1",
      "Issue 2"
    ],
    "recommendations": [
      "Issue 1",
      "Issue 2"
    ]
  },

  "priority_actions": [
    {
      "priority": "high",
      "action": "Most important improvement"
    },
    {
      "priority": "medium",
      "action": "Second improvement"
    }
  ]
}

Rules:
- Be specific.
- Think like a $500/hour consultant.
- Focus on increasing trust, traffic and conversions.
- Do not give generic advice.
- Return JSON only.
      `,
    });

    console.log("OPENAI RESPONSE:", response.output_text);
    const audit = JSON.parse(response.output_text);
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