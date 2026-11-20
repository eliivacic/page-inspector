import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page Inspector — AI website audits",
  description:
    "Find what's holding your website back. AI-powered audits across SEO, UX, performance, accessibility, copywriting and conversion, with a prioritized action plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={figtree.variable}>{children}</body>
    </html>
  );
}
