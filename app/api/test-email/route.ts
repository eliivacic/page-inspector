import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "info@salybearstudio.com",
      subject: "PageInspector test",
      html: "<h1>Čestitke! 🎉</h1><p>Tvoj prvi testni email deluje.</p>",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}