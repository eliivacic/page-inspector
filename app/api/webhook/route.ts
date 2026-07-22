import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const ownerEmail = process.env.OWNER_EMAIL;

// ---------- Design tokens ----------

const INK = "#18151A";
const SOFT = "#5B5560";
const LILAC = "#8B6FD9";
const LILAC_LIGHT = "#E7DBFA";
const MINT = "#1E6B48";
const MINT_BG = "#B9EBD3";
const AMBER = "#8A6800";
const AMBER_BG = "#FFF1BE";
const CORAL = "#9C2E1B";
const CORAL_BG = "#FFDAD1";
const BORDER = "#EAE6DF";
const BG = "#F8F6F1";

function scoreColor(score: number) {
  if (score >= 75) return MINT;
  if (score >= 50) return AMBER;
  return CORAL;
}

function scoreBg(score: number) {
  if (score >= 75) return MINT_BG;
  if (score >= 50) return AMBER_BG;
  return CORAL_BG;
}

const CATEGORY_LABELS: Record<string, string> = {
  seo: "SEO",
  ux: "User Experience",
  performance: "Performance",
  accessibility: "Accessibility",
  copywriting: "Copywriting",
  conversion: "Conversion",
};

const CATEGORY_ICONS: Record<string, string> = {
  seo: "🔎",
  ux: "🧭",
  performance: "⚡",
  accessibility: "♿",
  copywriting: "✍️",
  conversion: "🎯",
};

// ---------- Email section builders ----------

function categoryScorecard(categoryScores: Record<string, number>) {
  const rows = Object.keys(CATEGORY_LABELS)
    .filter((key) => typeof categoryScores?.[key] === "number")
    .map((key) => {
      const value = categoryScores[key];
      const color = scoreColor(value);

      return `
      <tr>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:${INK};width:150px;">
          ${CATEGORY_LABELS[key]}
        </td>
        <td style="padding:6px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${BORDER};border-radius:6px;height:8px;">
                <div style="background:${color};width:${value}%;height:8px;border-radius:6px;"></div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:6px 0 6px 12px;font-size:13px;font-weight:700;color:${color};width:36px;text-align:right;">
          ${value}
        </td>
      </tr>`;
    })
    .join("");

  if (!rows) return "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0 0;background:${BG};border:1.5px solid ${BORDER};border-radius:14px;">
    <tr>
      <td style="padding:20px 22px;">
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${SOFT};">
          Score by category
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${rows}
        </table>
      </td>
    </tr>
  </table>`;
}

function pagesAnalyzedSection(pages: { url: string; note?: string }[]) {
  if (!Array.isArray(pages) || pages.length === 0) return "";

  const rows = pages
    .map(
      (p) => `
    <div style="margin:0 0 12px 0;">
      <p style="margin:0 0 3px 0;font-size:12.5px;font-weight:700;color:${LILAC};word-break:break-all;">
        ${p.url}
      </p>
      ${
        p.note
          ? `<p style="margin:0;font-size:13px;line-height:1.5;color:${SOFT};">${p.note}</p>`
          : ""
      }
    </div>`
    )
    .join("");

  return `
  <tr>
    <td style="padding:0 36px 8px 36px;">
      <h2 style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:${INK};">
        Pages analyzed
      </h2>
      ${rows}
    </td>
  </tr>`;
}

function issuesList(items: string[] = []) {
  if (!items.length) return "";
  return `
    <ol style="margin:0 0 14px 0;padding:0 0 0 20px;">
      ${items
        .map(
          (item) => `
        <li style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:${INK};">
          ${item}
        </li>`
        )
        .join("")}
    </ol>`;
}

function recommendationsList(items: string[] = []) {
  if (!items.length) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;">
      <tr>
        <td style="background:${MINT_BG};border-radius:10px;padding:14px 16px;">
          <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${MINT};">
            Options to fix this
          </p>
          <ul style="margin:0;padding:0 0 0 18px;">
            ${items
              .map(
                (item, i) => `
              <li style="margin:0 0 8px 0;font-size:13.5px;line-height:1.5;color:${INK};">
                <strong>Option ${String.fromCharCode(65 + i)}: </strong>${item}
              </li>`
              )
              .join("")}
          </ul>
        </td>
      </tr>
    </table>`;
}

function categorySection(
  key: string,
  category?: { issues: string[]; recommendations: string[] },
  score?: number
) {
  if (!category) return "";

  const badge =
    typeof score === "number"
      ? `<span style="display:inline-block;background:${scoreBg(score)};color:${scoreColor(score)};font-size:12px;font-weight:700;padding:2px 10px;border-radius:100px;margin-left:8px;">${score}/100</span>`
      : "";

  return `
  <tr>
    <td style="padding:0 36px 28px 36px;">
      <h2 style="margin:0 0 14px 0;font-size:18px;font-weight:700;color:${INK};">
        ${CATEGORY_ICONS[key] || ""} ${CATEGORY_LABELS[key]}${badge}
      </h2>
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${SOFT};">
        Issues found
      </p>
      ${issuesList(category.issues)}
      ${recommendationsList(category.recommendations)}
    </td>
  </tr>
  <tr><td style="padding:0 36px;"><div style="border-top:1px solid ${BORDER};"></div></td></tr>`;
}

function priorityBadge(priority: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    high: { bg: CORAL_BG, fg: CORAL, label: "High priority" },
    medium: { bg: AMBER_BG, fg: AMBER, label: "Medium priority" },
    low: { bg: MINT_BG, fg: MINT, label: "Low priority" },
  };

  const style = map[priority?.toLowerCase()] || map.medium;

  return `<span style="display:inline-block;background:${style.bg};color:${style.fg};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;padding:3px 10px;border-radius:100px;white-space:nowrap;">${style.label}</span>`;
}

// ---------- Full report email ----------

function buildReportEmailHtml(audit: { score: number; report: any; website: string }) {
  const r = audit.report;
  const cs = r.category_scores || {};

  return `
<div style="background:${BG};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid ${INK};">

    <!-- Header -->
    <tr>
      <td style="background:${INK};padding:32px 36px;">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${LILAC_LIGHT};">
          Page Inspector
        </p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
          Your website audit report
        </h1>
        <p style="margin:8px 0 0 0;font-size:13.5px;color:rgba(255,255,255,0.65);word-break:break-all;">
          ${audit.website}
        </p>
      </td>
    </tr>

    <!-- Score + summary -->
    <tr>
      <td style="padding:32px 36px 8px 36px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:88px;height:88px;border-radius:50%;background:${LILAC_LIGHT};border:2px solid ${INK};text-align:center;vertical-align:middle;">
              <span style="font-size:28px;font-weight:700;color:${INK};">${audit.score}</span>
            </td>
            <td style="padding-left:20px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${SOFT};">
                Overall score / 100
              </p>
              <p style="margin:0;font-size:15px;font-weight:600;color:${INK};max-width:380px;">
                ${r.summary?.headline || ""}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 0 0;font-size:14.5px;line-height:1.6;color:${SOFT};">
          ${r.summary?.description || ""}
        </p>

        ${categoryScorecard(cs)}
      </td>
    </tr>

    <!-- Introduction -->
    <tr><td style="padding:28px 36px 0 36px;"><div style="border-top:1.5px solid ${BORDER};"></div></td></tr>
    <tr>
      <td style="padding:28px 36px 8px 36px;">
        <h2 style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:${INK};">
          Introduction
        </h2>
        <p style="margin:0;font-size:14px;line-height:1.65;color:${INK};">
          ${r.introduction || ""}
        </p>
      </td>
    </tr>

    <!-- Pages analyzed -->
    <tr><td style="padding:8px 36px 0 36px;"><div style="border-top:1.5px solid ${BORDER};"></div></td></tr>
    ${pagesAnalyzedSection(r.pages_analyzed)}

    <!-- Categories -->
    <tr><td style="padding:8px 36px 0 36px;"><div style="border-top:1.5px solid ${BORDER};"></div></td></tr>
    <tr>
      <td style="padding:28px 36px 8px 36px;">
        <h2 style="margin:0;font-size:18px;font-weight:700;color:${INK};">
          Detailed findings
        </h2>
      </td>
    </tr>
    ${categorySection("seo", r.seo, cs.seo)}
    ${categorySection("ux", r.ux, cs.ux)}
    ${categorySection("performance", r.performance, cs.performance)}
    ${categorySection("accessibility", r.accessibility, cs.accessibility)}
    ${categorySection("conversion", r.conversion, cs.conversion)}
    ${categorySection("copywriting", r.copywriting, cs.copywriting)}

    <!-- Priority actions -->
    <tr>
      <td style="padding:8px 36px 32px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:14px;border:1.5px solid ${BORDER};">
          <tr>
            <td style="padding:22px 24px;">
              <h2 style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:${INK};">
                Priority actions
              </h2>
              ${(r.priority_actions || [])
                .map(
                  (item: { priority: string; action: string }, i: number) => `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i === r.priority_actions.length - 1 ? "0" : "12px"};">
                  <tr>
                    <td style="width:130px;vertical-align:top;padding-top:1px;">
                      ${priorityBadge(item.priority)}
                    </td>
                    <td style="font-size:14px;line-height:1.5;color:${INK};">
                      ${item.action}
                    </td>
                  </tr>
                </table>`
                )
                .join("")}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:0 36px 32px 36px;">
        <div style="border-top:1.5px solid ${BORDER};padding-top:20px;">
          <p style="margin:0;font-size:13px;color:${SOFT};">
            Thanks for using Page Inspector. Questions about this report?
            Reply to this email and we'll take a look.
          </p>
        </div>
      </td>
    </tr>
  </table>

  <p style="text-align:center;font-size:12px;color:${SOFT};margin:20px 0 0 0;">
    © 2026 Page Inspector
  </p>
</div>`;
}

// ---------- Owner notification email ----------

function buildOwnerNotificationHtml(audit: {
  score: number;
  website: string;
  email: string;
}) {
  return `
<div style="background:${BG};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid ${INK};">
    <tr>
      <td style="background:${MINT};padding:24px 32px;">
        <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#ffffff;">
          💰 New sale
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <h1 style="margin:0 0 18px 0;font-size:20px;font-weight:700;color:${INK};">
          Someone just bought a full report
        </h1>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:${SOFT};width:110px;">Website</td>
            <td style="padding:6px 0;color:${INK};font-weight:600;word-break:break-all;">${audit.website}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:${SOFT};">Customer email</td>
            <td style="padding:6px 0;color:${INK};font-weight:600;word-break:break-all;">${audit.email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:${SOFT};">Score</td>
            <td style="padding:6px 0;color:${INK};font-weight:600;">${audit.score}/100</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:${SOFT};">Amount</td>
            <td style="padding:6px 0;color:${INK};font-weight:600;">€8.00</td>
          </tr>
        </table>

        <p style="margin:20px 0 0 0;font-size:13px;color:${SOFT};">
          The full report has already been sent to the customer automatically.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

// ---------- Webhook handler ----------

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email || session.customer_email;
    const auditId = session.metadata?.auditId;

    if (!email || !auditId) {
      console.error("Missing email or auditId");
      return NextResponse.json({ error: "Missing checkout data" }, { status: 400 });
    }

    const { data: audit, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (error || !audit) {
      console.error("Audit not found:", error);
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.paid) {
      console.log("Audit already marked as paid, skipping duplicate email.");
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { error: emailError } = await resend.emails.send({
      from: "PageInspector <reports@page-inspector.com>",
      to: email,
      subject: "Your PageInspector Website Audit Report",
      html: buildReportEmailHtml(audit),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
    }

    console.log("✅ Report sent to:", email);

    if (ownerEmail) {
      try {
        await resend.emails.send({
          from: "PageInspector <reports@page-inspector.com>",
          to: ownerEmail,
          subject: `💰 New sale: ${audit.website}`,
          html: buildOwnerNotificationHtml({
            score: audit.score,
            website: audit.website,
            email,
          }),
        });
        console.log("✅ Owner notified of sale");
      } catch (ownerEmailError) {
        console.error("Could not send owner notification:", ownerEmailError);
      }
    } else {
      console.log("OWNER_EMAIL not set, skipping owner notification.");
    }

    const { error: updateError } = await supabase
      .from("audits")
      .update({ paid: true, email })
      .eq("id", auditId);

    if (updateError) {
      console.error("Could not mark audit as paid:", updateError);
    }
  }

  return NextResponse.json({ received: true });
}