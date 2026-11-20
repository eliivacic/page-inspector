import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using Page Inspector website audits.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1E1F21]">
      <nav className="border-b border-black/10 bg-[#FFFFFF]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center px-6 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.02em]">
            <span className="flex items-center gap-[3px]" aria-hidden>
              <i className="block h-[9px] w-[9px] rounded-full bg-[#F06A6A]" />
              <i className="block h-[9px] w-[9px] rounded-full bg-[#796EFF]" />
              <i className="block h-[9px] w-[9px] rounded-full bg-[#1E1F21]" />
            </span>
            Page Inspector
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-[760px] px-6 py-20 sm:px-8">
        <h1 className="font-display text-[32px] font-semibold sm:text-[42px]">Terms of Use</h1>
        <p className="mt-3 text-[14px] text-[#6D6E6F]">Last updated: November 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-[1.7] text-[#1E1F21]">
          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">What Page Inspector does</h2>
            <p>
              Page Inspector is operated by VELORIA d.o.o., Rakuševa ulica 8, 1000 Ljubljana, Slovenia (registration no. 7357974000, tax no. 89482786). It analyzes the publicly available content of a website you submit and produces an audit report covering SEO, user experience, performance, accessibility, copywriting and conversion. The free preview shows a summary; the full report (8 EUR, one-time payment) is delivered by email and as a PDF after payment.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Nature of the report</h2>
            <p>
              Reports are generated automatically by software, including AI language models, based on the publicly accessible content of your pages at the time of the scan. They are intended as practical guidance, not professional consulting, legal advice or technical certification, and may not capture every issue or reflect changes made after the audit.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Payments and refunds</h2>
            <p>
              Payments are processed securely by Stripe; we never see or store your card details. The report is delivered digitally right after payment. If the full report isn&apos;t useful to you, email us at support@page-inspector.com within 14 days of purchase and we will refund the full amount. If your report doesn&apos;t arrive, contact us and we will resend it or refund you.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Acceptable use</h2>
            <p>
              You agree to submit only websites you own or have permission to analyze.
              You agree not to use the service to attempt to overload, scrape maliciously,
              or otherwise disrupt any third-party website.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Limitation of liability</h2>
            <p>
              Page Inspector is provided "as is" without warranties of any kind. We are
              not liable for any decisions made, or outcomes resulting from, actions taken
              based on this report.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Contact</h2>
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:support@page-inspector.com" className="font-semibold underline underline-offset-2">
                support@page-inspector.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-10">
          <a
            href="/"
            className="inline-flex rounded-xl border border-[#EDEAE9] bg-white px-6 py-3 text-[14px] font-bold transition-transform hover:"
          >
            &larr; Back to homepage
          </a>
        </div>
      </section>

      <footer className="bg-[#FFE9E7]">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-3.5 px-6 py-10 text-[13.5px] font-medium sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 Page Inspector</span>
          <div className="flex gap-[22px] font-semibold">
            <a href="/privacy" className="transition-opacity hover:opacity-60">Privacy policy</a>
            <a href="/terms" className="transition-opacity hover:opacity-60">Terms of use</a>
          </div>
        </div>
      </footer>
    </main>
  );
}