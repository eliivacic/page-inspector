import Stripe from "stripe";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ---------- Design tokens ----------

const INK = "#18151A";
const SOFT = "#5B5560";
const LILAC = "#8B6FD9";
const LILAC_LIGHT = "#E7DBFA";
const MINT = "#1E6B48";
const AMBER = "#8A6800";
const CORAL = "#9C2E1B";
const BORDER = "#D9D2CC";

function scoreColor(score: number) {
  if (score >= 75) return MINT;
  if (score >= 50) return AMBER;
  return CORAL;
}

const CATEGORY_LABELS: Record<string, string> = {
  seo: "SEO",
  ux: "User Experience",
  performance: "Performance",
  accessibility: "Accessibility",
  copywriting: "Copywriting",
  conversion: "Conversion",
};

const PAGE_MARGIN = 56;
const BOTTOM_SAFE_Y = 780; // A4 height (~842pt) minus margin — stop writing past this

// ---------- PDF report generation ----------

function buildReportPdfBuffer(audit: {
  website: string;
  score: number;
  report: any;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const r = audit.report;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;

    // Ensures we never write past the bottom margin — adds a new page if needed
    function ensureSpace(estimatedHeight: number) {
      if (doc.y + estimatedHeight > BOTTOM_SAFE_Y) {
        doc.addPage();
        doc.y = PAGE_MARGIN;
      }
    }

    function heightOfText(text: string, font: string, size: number, width: number) {
      doc.font(font).fontSize(size);
      return doc.heightOfString(text, { width });
    }

    // ---------- Cover header ----------
    doc.rect(0, 0, pageWidth, 130).fill(INK);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Page Inspector", 56, 36);
    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor(LILAC_LIGHT)
      .text("Website Audit Report", 56, 62);
    doc
      .fontSize(10)
      .fillColor("#D8CFED")
      .text(audit.website, 56, 84, { width: contentWidth });

    doc.y = 160;
    doc.x = PAGE_MARGIN;

    // ---------- Overall score ----------
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor(scoreColor(audit.score))
      .text(`${audit.score}/100`, PAGE_MARGIN, doc.y);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(SOFT)
      .text("Overall score", PAGE_MARGIN, doc.y + 2);

    doc.moveDown(2);
    doc.x = PAGE_MARGIN;
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(INK)
      .text(r.summary?.headline || "", PAGE_MARGIN, doc.y, { width: contentWidth });
    doc.moveDown(0.5);
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(SOFT)
      .text(r.summary?.description || "", { width: contentWidth });

    // ---------- Introduction ----------
    doc.moveDown(1.5);
    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text("Introduction", PAGE_MARGIN);
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(SOFT)
      .text(r.introduction || "", { width: contentWidth });

    // ---------- Pages analyzed ----------
    if (Array.isArray(r.pages_analyzed) && r.pages_analyzed.length > 0) {
      doc.moveDown(1.2);
      ensureSpace(40);
      doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text("Pages Analyzed", PAGE_MARGIN);
      doc.moveDown(0.3);

      r.pages_analyzed.forEach((p: { url: string; note?: string }) => {
        const estHeight =
          heightOfText(`• ${p.url}`, "Helvetica-Bold", 9.5, contentWidth) +
          (p.note ? heightOfText(p.note, "Helvetica", 9.5, contentWidth - 12) : 0) +
          10;
        ensureSpace(estHeight);

        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(LILAC)
          .text(`• ${p.url}`, PAGE_MARGIN, doc.y, { width: contentWidth });
        if (p.note) {
          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor(SOFT)
            .text(p.note, PAGE_MARGIN + 12, doc.y, { width: contentWidth - 12 });
        }
        doc.moveDown(0.3);
      });
    }

    // ---------- Score by category ----------
    doc.moveDown(1);
    ensureSpace(160);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text("Score by Category", PAGE_MARGIN);
    doc.moveDown(0.4);

    const cs = r.category_scores || {};
    const barWidth = contentWidth - 140;

    Object.keys(CATEGORY_LABELS).forEach((key) => {
      if (typeof cs[key] !== "number") return;

      ensureSpace(20);
      const y = doc.y;

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(INK)
        .text(CATEGORY_LABELS[key], PAGE_MARGIN, y, { width: 130 });

      doc.rect(PAGE_MARGIN + 135, y + 1, barWidth, 7).fill(BORDER);
      doc
        .rect(PAGE_MARGIN + 135, y + 1, (barWidth * cs[key]) / 100, 7)
        .fill(scoreColor(cs[key]));

      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(scoreColor(cs[key]))
        .text(`${cs[key]}`, PAGE_MARGIN + 135 + barWidth + 8, y, { width: 30 });

      doc.y = y + 18;
    });

    // ---------- Category detail sections (one page each, with overflow protection) ----------
    Object.keys(CATEGORY_LABELS).forEach((key) => {
      const category = r[key];
      if (!category) return;

      doc.addPage();
      doc.y = PAGE_MARGIN;

      doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(INK)
        .text(CATEGORY_LABELS[key], PAGE_MARGIN, PAGE_MARGIN);

      if (typeof cs[key] === "number") {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(scoreColor(cs[key]))
          .text(`Score: ${cs[key]}/100`, PAGE_MARGIN, PAGE_MARGIN + 24);
      }

      doc.y = PAGE_MARGIN + 60;
      doc.x = PAGE_MARGIN;

      doc.font("Helvetica-Bold").fontSize(12.5).fillColor(INK).text("Issues Found", PAGE_MARGIN);
      doc.moveDown(0.4);

      (category.issues || []).forEach((issue: string, i: number) => {
        const label = `${i + 1}. `;
        const estHeight = heightOfText(label + issue, "Helvetica", 10, contentWidth) + 8;
        ensureSpace(estHeight);

        const startY = doc.y;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(CORAL);
        const labelWidth = doc.widthOfString(label);
        doc.text(label, PAGE_MARGIN, startY, { continued: true, width: contentWidth });
        doc.font("Helvetica").fillColor(INK).text(issue, { width: contentWidth });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.6);
      ensureSpace(30);
      doc.font("Helvetica-Bold").fontSize(12.5).fillColor(INK).text("Recommended Options", PAGE_MARGIN);
      doc.moveDown(0.4);

      (category.recommendations || []).forEach((rec: string, i: number) => {
        const label = `Option ${String.fromCharCode(65 + i)}: `;
        const estHeight = heightOfText(label + rec, "Helvetica", 10, contentWidth) + 8;
        ensureSpace(estHeight);

        const startY = doc.y;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(MINT);
        doc.text(label, PAGE_MARGIN, startY, { continued: true, width: contentWidth });
        doc.font("Helvetica").fillColor(INK).text(rec, { width: contentWidth });
        doc.moveDown(0.5);
      });
    });

    // ---------- Priority actions (final page) ----------
    doc.addPage();
    doc.y = PAGE_MARGIN;
    doc.font("Helvetica-Bold").fontSize(17).fillColor(INK).text("Priority Actions", PAGE_MARGIN);
    doc.moveDown(1.2);
    doc.x = PAGE_MARGIN;

    (r.priority_actions || []).forEach((item: { priority: string; action: string }) => {
      const color =
        item.priority === "high" ? CORAL : item.priority === "medium" ? AMBER : MINT;
      const label = `[${item.priority?.toUpperCase()}] `;
      const estHeight = heightOfText(label + item.action, "Helvetica", 10, contentWidth) + 12;
      ensureSpace(estHeight);

      const startY = doc.y;
      doc.font("Helvetica-Bold").fontSize(10).fillColor(color);
      doc.text(label, PAGE_MARGIN, startY, { continued: true, width: contentWidth });
      doc.font("Helvetica").fillColor(INK).text(item.action, { width: contentWidth });

      doc.moveDown(0.8);
    });

    doc.moveDown(2);
    ensureSpace(20);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SOFT)
      .text("Thank you for using Page Inspector.", PAGE_MARGIN);

    doc.end();
  });
}

// ---------- Short notification email ----------

function buildNotificationEmailHtml(audit: { score: number; website: string }) {
  return `
<div style="background:#F8F6F1;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1.5px solid ${INK};">
    <tr>
      <td style="background:${INK};padding:32px 36px;">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${LILAC_LIGHT};">
          Page Inspector
        </p>
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
          Your full audit report is attached
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 36px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:72px;height:72px;border-radius:50%;background:${LILAC_LIGHT};border:2px solid ${INK};text-align:center;vertical-align:middle;">
              <span style="font-size:22px;font-weight:700;color:${INK};">${audit.score}</span>
            </td>
            <td style="padding-left:18px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${SOFT};">
                Overall score
              </p>
              <p style="margin:0;font-size:13.5px;color:${SOFT};max-width:340px;">
                for ${audit.website}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 0 0;font-size:14.5px;line-height:1.6;color:${INK};">
          We've put together a full, detailed breakdown across all six areas —
          SEO, user experience, performance, accessibility, copywriting and
          conversion — with concrete findings and multiple fix options for
          each. It's attached to this email as a PDF.
        </p>

        <p style="margin:20px 0 0 0;font-size:13px;color:${SOFT};">
          Questions about the report? Just reply to this email.
        </p>
      </td>
    </tr>
  </table>
  <p style="text-align:center;font-size:12px;color:${SOFT};margin:20px 0 0 0;">
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

    if (audit.paid) {
      console.log("Audit already marked as paid, skipping duplicate email.");
      return NextResponse.json({ received: true, duplicate: true });
    }

    let pdfBuffer: Buffer;

    try {
      pdfBuffer = await buildReportPdfBuffer(audit);
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      return NextResponse.json({ error: "Could not generate PDF report" }, { status: 500 });
    }

    const { error: emailError } = await resend.emails.send({
      from: "PageInspector <onboarding@resend.dev>",
      to: email,
      subject: "Your PageInspector Website Audit Report",
      html: buildNotificationEmailHtml(audit),
      attachments: [
        {
          filename: "page-inspector-audit-report.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
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