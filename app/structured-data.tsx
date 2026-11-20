import { faqs } from "@/lib/content";

const SITE = "https://www.page-inspector.com";

const data = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Page Inspector",
    url: SITE,
    email: "support@page-inspector.com",
    legalName: "VELORIA d.o.o.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rakuševa ulica 8",
      postalCode: "1000",
      addressLocality: "Ljubljana",
      addressCountry: "SI",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Page Inspector full website audit report",
    description:
      "Website audit covering SEO, user experience, performance, accessibility, copywriting and conversion, with step-by-step fixes and a prioritized action plan, delivered by email and as a PDF.",
    brand: { "@type": "Brand", name: "Page Inspector" },
    offers: {
      "@type": "Offer",
      price: "8.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: SITE,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Static, first-party JSON; "<" escaped so content can never close the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
