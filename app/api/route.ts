import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook verification failed:", err);

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log("✅ Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email =
      session.customer_details?.email ||
      session.customer_email;

    const auditId = session.metadata?.auditId;

    if (!email || !auditId) {
      console.error("Missing email or auditId");

      return NextResponse.json(
        { error: "Missing checkout data" },
        { status: 400 }
      );
    }

    const { data: audit, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (error || !audit) {
      console.error("Audit not found:", error);

      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const report = audit.report;

    await resend.emails.send({
      from: "PageInspector <onboarding@resend.dev>",
      to: email,
      subject: "Your PageInspector Website Audit Report",
      html: `
      <div style="font-family:Arial;max-width:700px;margin:auto;color:#333">

        <h1 style="color:#18392b">
          PageInspector Report
        </h1>

        <h2>
          Score: ${audit.score}/100
        </h2>

        <h2>
          ${report.summary.headline}
        </h2>

        <p>
          ${report.summary.description}
        </p>

        <hr />

        <h2>SEO</h2>
        <ul>
          ${report.seo.issues
            .map((x: string) => `<li>${x}</li>`)
            .join("")}
        </ul>

        <h2>User Experience</h2>
        <ul>
          ${report.ux.issues
            .map((x: string) => `<li>${x}</li>`)
            .join("")}
        </ul>

        <h2>Performance</h2>
        <ul>
          ${report.performance.issues
            .map((x: string) => `<li>${x}</li>`)
            .join("")}
        </ul>

        <h2>Priority Actions</h2>
        <ol>
          ${report.priority_actions
            .map(
              (x: any) =>
                `<li><strong>${x.priority}</strong>: ${x.action}</li>`
            )
            .join("")}
        </ol>

        <hr />

        <p>
          Thank you for using PageInspector.
        </p>

      </div>
      `,
    });

    console.log("✅ Report sent to:", email);
  }

  return NextResponse.json({
    received: true,
  });
}