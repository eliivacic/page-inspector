from pathlib import Path
import zipfile

root = Path("/mnt/data/pageinspector-privacy")
page_dir = root / "app" / "privacy"
page_dir.mkdir(parents=True, exist_ok=True)

page = r'''import Link from "next/link";

const sections = [
  {
    title: "1. Information we collect",
    content: (
      <>
        <p>When you use Page Inspector, we may collect:</p>
        <ul>
          <li>Your email address.</li>
          <li>The website URL you submit for analysis.</li>
          <li>
            Technical information such as your IP address, browser type,
            operating system and device information.
          </li>
          <li>
            Usage information about how you interact with our website and
            services.
          </li>
          <li>
            Payment status and transaction-related information provided by our
            payment processor.
          </li>
        </ul>
        <p>
          We do not receive or store your complete payment-card details.
        </p>
      </>
    ),
  },
  {
    title: "2. How we use your information",
    content: (
      <>
        <p>We may use your information to:</p>
        <ul>
          <li>Generate AI-powered website audits and previews.</li>
          <li>Deliver purchased reports to your email address.</li>
          <li>Process payments and confirm successful purchases.</li>
          <li>Operate, secure and improve Page Inspector.</li>
          <li>Respond to questions and support requests.</li>
          <li>Prevent fraud, abuse and unauthorised use.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Legal bases for processing",
    content: (
      <>
        <p>
          Where the General Data Protection Regulation or similar laws apply,
          we process personal data on one or more of the following legal bases:
        </p>
        <ul>
          <li>
            <strong>Performance of a contract:</strong> to provide the audit or
            report you request and process your purchase.
          </li>
          <li>
            <strong>Legitimate interests:</strong> to secure, maintain and
            improve our service, prevent misuse and understand service
            performance.
          </li>
          <li>
            <strong>Legal obligations:</strong> when we must retain or disclose
            information under applicable law.
          </li>
          <li>
            <strong>Consent:</strong> where consent is required, for example
            for certain optional cookies or marketing communications.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. AI processing",
    content: (
      <>
        <p>
          Page Inspector uses artificial intelligence to analyse submitted
          website information and generate audit results.
        </p>
        <p>
          Information necessary to provide the audit may be sent to trusted AI
          service providers, including OpenAI. We use these providers only as
          needed to generate and operate the requested service.
        </p>
        <p>
          AI-generated results may contain errors and should be reviewed before
          you rely on them for business, technical or legal decisions.
        </p>
      </>
    ),
  },
  {
    title: "5. Payments",
    content: (
      <>
        <p>
          Payments are processed by Stripe. Stripe may collect and process
          payment details, billing information, fraud-prevention information
          and other data necessary to complete a transaction.
        </p>
        <p>
          Page Inspector does not receive or store your complete payment-card
          number.
        </p>
      </>
    ),
  },
  {
    title: "6. Service providers",
    content: (
      <>
        <p>
          We may share limited information with service providers that help us
          operate Page Inspector, including:
        </p>
        <ul>
          <li>Stripe for payment processing.</li>
          <li>OpenAI for AI-powered analysis.</li>
          <li>Supabase for database and storage infrastructure.</li>
          <li>Vercel for website hosting and deployment.</li>
          <li>Resend for transactional email delivery.</li>
        </ul>
        <p>
          These providers may process information only as necessary to provide
          their services to us and according to their own legal and privacy
          obligations.
        </p>
      </>
    ),
  },
  {
    title: "7. Cookies and similar technologies",
    content: (
      <>
        <p>
          Page Inspector may use essential cookies and similar technologies to
          keep the website secure and functioning correctly.
        </p>
        <p>
          If we introduce non-essential analytics, advertising or marketing
          cookies, we will provide any notice and choice required by applicable
          law.
        </p>
      </>
    ),
  },
  {
    title: "8. Data retention",
    content: (
      <>
        <p>
          We keep personal data only for as long as reasonably necessary to
          provide our services, maintain business and transaction records,
          resolve disputes, prevent abuse and comply with legal obligations.
        </p>
        <p>
          Retention periods may differ depending on the type of information and
          why it was collected.
        </p>
      </>
    ),
  },
  {
    title: "9. International data transfers",
    content: (
      <>
        <p>
          Some service providers may process information in countries other
          than the country where you live.
        </p>
        <p>
          Where required, appropriate safeguards are used for international
          transfers of personal data.
        </p>
      </>
    ),
  },
  {
    title: "10. Your privacy rights",
    content: (
      <>
        <p>
          Depending on where you live, you may have the right to:
        </p>
        <ul>
          <li>Request access to your personal data.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of your personal data.</li>
          <li>Request restriction of processing.</li>
          <li>Object to certain processing.</li>
          <li>Request data portability.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>
            Lodge a complaint with your local data-protection authority.
          </li>
        </ul>
        <p>
          To submit a request, contact us using the details at the end of this
          policy. We may need to verify your identity before completing a
          request.
        </p>
      </>
    ),
  },
  {
    title: "11. Security",
    content: (
      <>
        <p>
          We use reasonable technical and organisational measures intended to
          protect personal data from unauthorised access, loss, misuse,
          alteration or disclosure.
        </p>
        <p>
          No internet transmission or electronic storage system can be
          guaranteed to be completely secure.
        </p>
      </>
    ),
  },
  {
    title: "12. Children's privacy",
    content: (
      <>
        <p>
          Page Inspector is not intended for children under the age of 16, and
          we do not knowingly collect personal data from children.
        </p>
      </>
    ),
  },
  {
    title: "13. Third-party websites",
    content: (
      <>
        <p>
          Our website may contain links to third-party websites. Their privacy
          practices are governed by their own policies, and we are not
          responsible for those websites.
        </p>
      </>
    ),
  },
  {
    title: "14. Changes to this policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. We will publish
          the revised version on this page and change the “Last updated” date.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#17141c]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-[920px] items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-[13px] font-bold uppercase tracking-[-0.02em]"
          >
            Page <span className="text-[#8656d8]">Inspector</span>
          </Link>

          <Link
            href="/"
            className="rounded-full bg-[#17131c] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[920px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="max-w-[690px]">
          <span className="inline-flex rounded-full border border-[#17131c] bg-[#e8dcfa] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
            Privacy policy
          </span>

          <h1 className="mt-5 text-[44px] font-bold leading-[0.98] tracking-[-0.055em] sm:text-[68px]">
            Your privacy,
            <br />
            clearly explained.
          </h1>

          <p className="mt-6 max-w-[610px] text-[15px] leading-7 text-black/65 sm:text-[17px]">
            This policy explains what information Page Inspector collects, why
            we use it, which service providers help us operate the product and
            what choices you have.
          </p>

          <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.06em] text-black/55">
            Last updated: 22 July 2026
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-20">
          <article className="rounded-[18px] border border-black bg-[#fff3b4] p-6 shadow-[5px_5px_0_#17131c] sm:p-8">
            <h2 className="text-[19px] font-bold tracking-[-0.03em]">
              Who is responsible for your data?
            </h2>
            <div className="mt-4 space-y-4 text-[14px] leading-7 text-black/70 sm:text-[15px]">
              <p>
                Page Inspector is responsible for the personal data described
                in this policy.
              </p>
              <p>
                Before publishing, replace the contact details below with your
                legal business name, registered address and working privacy
                email address where applicable.
              </p>
            </div>
          </article>

          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[18px] border border-black/20 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-black/50 hover:shadow-[0_14px_35px_rgba(23,19,28,0.08)] sm:p-8"
            >
              <h2 className="text-[18px] font-bold tracking-[-0.025em] sm:text-[20px]">
                {section.title}
              </h2>

              <div className="policy-copy mt-4 space-y-4 text-[14px] leading-7 text-black/68 sm:text-[15px]">
                {section.content}
              </div>
            </article>
          ))}

          <article className="rounded-[18px] border border-black bg-[#dfcff7] p-6 shadow-[5px_5px_0_#17131c] sm:p-8">
            <span className="inline-flex rounded-full border border-black bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
              Contact
            </span>

            <h2 className="mt-4 text-[26px] font-bold tracking-[-0.04em]">
              Questions about your data?
            </h2>

            <div className="mt-4 space-y-2 text-[14px] leading-7 text-black/70 sm:text-[15px]">
              <p>
                <strong>Service:</strong> Page Inspector
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@pageinspector.ai"
                  className="font-semibold underline decoration-1 underline-offset-4"
                >
                  support@pageinspector.ai
                </a>
              </p>
              <p>
                <strong>Legal entity:</strong> Add your legal business name
              </p>
              <p>
                <strong>Registered address:</strong> Add your business address
              </p>
            </div>
          </article>
        </div>
      </section>

      <footer className="bg-[#dfcff7]">
        <div className="mx-auto flex max-w-[920px] flex-col gap-3 px-5 py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 Page Inspector</span>

          <div className="flex gap-5">
            <Link href="/privacy" className="font-semibold">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-55">
              Terms of use
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
'''

readme = r'''PAGE INSPECTOR – PRIVACY POLICY

1. Copy the folder:
   app/privacy

   into your project.

2. Before publishing, open:
   app/privacy/page.tsx

   and replace:
   - support@pageinspector.ai
   - "Add your legal business name"
   - "Add your business address"

3. Your existing footer link should point to:
   /privacy

4. Test locally:
   npm run dev

   Then open:
   http://localhost:3000/privacy

5. Publish:
   git add .
   git commit -m "Add privacy policy"
   git push

This template is a practical starting point, not legal advice. Make sure the
policy matches the data your production app actually collects and the services
it actually uses.
'''

(page_dir / "page.tsx").write_text(page, encoding="utf-8")
(root / "README.txt").write_text(readme, encoding="utf-8")

zip_path = Path("/mnt/data/pageinspector-privacy-policy.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for path in root.rglob("*"):
        if path.is_file():
            z.write(path, path.relative_to(root))

print(zip_path)
print(page_dir / "page.tsx")
