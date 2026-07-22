import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const auditId = session.metadata?.auditId;

    if (!auditId) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    const { data: audit, error } = await supabase
      .from("audits")
      .select("paid, email, website")
      .eq("id", auditId)
      .single();

    if (error || !audit) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      paid: audit.paid,
      email: audit.email || session.customer_details?.email || null,
      website: audit.website,
    });
  } catch (err) {
    console.error("Order status error:", err);
    return NextResponse.json(
      { error: "Could not check status" },
      { status: 500 }
    );
  }
}