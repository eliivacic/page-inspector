import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ---------- Email design helpers ----------

const COLORS = {
  ink: "#18151A",
  lilac: "#E7DBFA",
  lilacDeep: "#8B6FD9",
  yellow: "#FFD84D",
  mint: "#B9EBD3",
  mintDeep: "#1E6B48",
  coral: "#FF8B76",
  coralDeep: "#9C2E1B",
  soft: "#5B5560",
  bg: "#F8F6F1",
  border: "#EAE6DF",
};

function issuesList(items: string[] = []) {
  if (!items.length) return "";
  return `
    <ul style="margin:0 0 16px 0;padding:0 0 0 20px;">
      ${items
        .map(
          (item) => `
        <li style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:${COLORS.ink};">
          ${item}
        </li>`
        )
        .join("")}
    </ul>`;
}

function recommendationsList(items: string[] = []) {
  if (!items.length) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="background:${COLORS.mint};border-radius:10px;padding:14px 16px;">
          <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${COLORS.mintDeep};">
            Recommended fixes
          </p>
          <ul style="margin:0;padding:0 0 0 18px;">
            ${items
              .map(
                (item) => `
              <li style="margin:0 0 6px 0;font-size:13.5px;line-height:1.5;color:${COLORS.ink};">
                ${item}
              </li>`
              )
              .join("")}
          </ul>
        </td>
      </tr>
    </table>`;
}

function categorySection(title: string, icon: string, category?: { issues: string[]; recommendations: string[] }) {
  if (!category) return "";

  return `
  <tr>
    <td style="padding:0 0 28px 0;">
      <h3 style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:${COLORS.ink};">
        ${icon} ${title}
      </h3>
      ${issuesList(category.issues)}
      ${recommendationsList(category.recommendations)}
    </td>
  </tr>`;
}

function priorityBadge(priority: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    high: { bg: "#FFDAD1", fg: COLORS.coralDeep, label: "High priority" },
    medium: { bg: "#FFF1BE", fg: "#8A6800", label: "Medium priority" },
    low: { bg: COLORS.mint, fg: COLORS.mintDeep, label: "Low priority" },
  };

  const style = map[priority?.toLowerCase()] || map.medium;

  return `<span style="display:inline-block;background:${style.bg};color:${style.fg};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;padding:3px 10px;border-radius:100px;white-space:nowrap;">${style.label}</span>`;
}

function buildReportEmailHtml(audit: { score: number; report: any; website: string }) {
  const r = audit.report;

  return `
<div style="background:${COLORS.bg};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid ${COLORS.ink};">

    <!-- Header -->
    <tr>
      <td style="background:${COLORS.ink};padding:32px 36px;">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.lilac};">
          Page Inspector
        </p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
          Your website audit report is ready
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
            <td style="width:88px;height:88px;border-radius:50%;background:${COLORS.lilac};border:2px solid ${COLORS.ink};text-align:center;vertical-align:middle;">
              <span style="font-size:28px;font-weight:700;color:${COLORS.ink};">${audit.score}</span>
            </td>
            <td style="padding-left:20px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${COLORS.soft};">
                Overall score / 100
              </p>
              <p style="margin:0;font-size:15px;font-weight:600;color:${COLORS.ink};max-width:380px;">
                ${r.summary?.headline || ""}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 0 0;font-size:14.5px;line-height:1.6;color:${COLORS.soft};">
          ${r.summary?.description || ""}
        </p>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:24px 36px 0 36px;"><div style="border-top:1.5px solid ${COLORS.border};"></div></td></tr>

    <!-- Categories -->
    <tr>
      <td style="padding:28px 36px 0 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${categorySection("SEO", "🔎", r.seo)}
          ${categorySection("User experience", "🧭", r.ux)}
          ${categorySection("Performance", "⚡", r.performance)}
          ${categorySection("Conversion", "🎯", r.conversion)}
          ${categorySection("Copywriting", "✍️", r.copywriting)}
        </table>
      </td>
    </tr>

    <!-- Priority actions -->
    <tr>
      <td style="padding:4px 36px 32px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};border-radius:14px;border:1.5px solid ${COLORS.border};">
          <tr>
            <td style="padding:22px 24px;">
              <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:${COLORS.ink};">
                Priority actions
              </h3>
              ${(r.priority_actions || [])
                .map(
                  (item: { priority: string; action: string }, i: number) => `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i === r.priority_actions.length - 1 ? "0" : "12px"};">
                  <tr>
                    <td style="width:130px;vertical-align:top;padding-top:1px;">
                      ${priorityBadge(item.priority)}
                    </td>
                    <td style="font-size:14px;line-height:1.5;color:${COLORS.ink};">
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
        <div style="border-top:1.5px solid ${COLORS.border};padding-top:20px;">
          <p style="margin:0;font-size:13px;color:${COLORS.soft};">
            Thanks for using Page Inspector. Questions about this report?
            Reply to this email and we'll take a look.
          </p>
        </div>
      </td>
    </tr>
  </table>

  <p style="text-align:center;font-size:12px;color:${COLORS.soft};margin:20px 0 0 0;">
    © 2026 Page Inspector
  </p>
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

    // Preprečimo podvojeno pošiljanje, če Stripe pošlje isti event večkrat
    if (audit.paid) {
      console.log("Audit already marked as paid, skipping duplicate email.");
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { error: emailError } = await resend.emails.send({
      from: "PageInspector <onboarding@resend.dev>",
      to: email,
      subject: "Your PageInspector Website Audit Report",
      html: buildReportEmailHtml(audit),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
    }

    console.log("✅ Report sent to:", email);

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