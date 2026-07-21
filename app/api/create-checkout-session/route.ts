import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, url, auditId } = await req.json();

    if (!email || !url || !auditId) {
      return NextResponse.json(
        { error: "Missing checkout information" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "PageInspector Full Report",
            },
            unit_amount: 800,
          },
          quantity: 1,
        },
      ],

      customer_email: email,

      metadata: {
        website: url,
        auditId,
      },

      success_url: "https://page-inspector.com?success=true",
      cancel_url: "https://page-inspector.com?canceled=true",
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}