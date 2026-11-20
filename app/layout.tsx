import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import StructuredData from "./structured-data";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

const description =
  "Free website audit in about two minutes: see what's hurting your SEO, usability, speed, accessibility and conversions — then get a prioritized plan to fix it.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.page-inspector.com"),
  title: {
    default: "Free Website Audit — SEO, UX & Conversion Check | Page Inspector",
    template: "%s · Page Inspector",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Page Inspector",
    title: "Free Website Audit — SEO, UX & Conversion Check | Page Inspector",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Website Audit — SEO, UX & Conversion Check | Page Inspector",
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
      <body className={figtree.variable}>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
