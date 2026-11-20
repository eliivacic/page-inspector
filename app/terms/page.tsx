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
        <p className="mt-3 text-[14px] text-[#6D6E6F]">Last updated: July 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-[1.7] text-[#1E1F21]">
          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">What Page Inspector does</h2>
            <p>
              Page Inspector analyzes publicly available content on a website you submit
              and generates an AI-produced audit report covering SEO, user experience,
              performance, accessibility, copywriting and conversion. The free preview
              gives a summary; the paid full report (8 EUR, one-time) is delivered by email
              as a PDF after payment.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Nature of the report</h2>
            <p>
              Reports are generated automatically using AI and are intended as general
              guidance, not professional consulting, legal, or technical certification.
              Findings are based on publicly accessible content at the time of the scan
              and may not capture every issue or reflect changes made after the audit.
            </p>
          </div>

          <div>
            <h2 className="font-display mb-2 text-[20px] font-semibold">Payments and refunds</h2>
            <p>
              Payments are processed securely via Stripe. Because the report is generated
              and delivered digitally and immediately upon payment, purchases are generally
              final. If you believe you did not receive your report, contact us and we
              will investigate and make it right.
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