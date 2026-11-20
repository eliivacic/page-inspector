import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

const description =
  "Find what's holding your website back. AI-powered audits across SEO, UX, performance, accessibility, copywriting and conversion, with a prioritized action plan.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.page-inspector.com"),
  title: {
    default: "Page Inspector — AI website audit in under 60 seconds",
    template: "%s · Page Inspector",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Page Inspector",
    title: "Page Inspector — AI website audit in under 60 seconds",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Inspector — AI website audit in under 60 seconds",
    description,
  },
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
