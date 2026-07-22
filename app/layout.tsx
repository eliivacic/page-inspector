import type { Metadata } from "next";
import { Poppins, Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Display font for headings — playful, rounded, gives the "fun but modern" feel
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

// Mono font for URLs, scores, badges — reinforces the "inspection/data" feel
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PageInspector",
  description:
    "AI-powered website audits with clear, practical recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${fredoka.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}