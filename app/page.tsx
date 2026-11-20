"use client";

import { useEffect, useRef, useState } from "react";

type AuditResult = {
  success: boolean;
  website: string;
  score: number;
  preview: {
    seo: string;
    ux: string;
    performance: string;
  };
};

const categories = [
  { title: "User experience", tint: "bg-[#EEECFF]", dot: "bg-[#796EFF]", desc: "How visitors actually move through your site — navigation, clarity, and friction points that make people leave." },
  { title: "SEO", tint: "bg-[#E3F3EB]", dot: "bg-[#3E8F6C]", desc: "Titles, headings and structure — what's keeping search engines from understanding your pages." },
  { title: "Performance", tint: "bg-[#FDF1DC]", dot: "bg-[#E8A33D]", desc: "Load times and technical drag that cost you visitors before they even see the page." },
  { title: "Accessibility", tint: "bg-[#E4F0FB]", dot: "bg-[#4A8FD8]", desc: "Contrast, labels and structure — so the site works for every visitor, not just the ones it was tested on." },
  { title: "Copywriting", tint: "bg-[#FFE9E7]", dot: "bg-[#F06A6A]", desc: "Whether your headlines actually say what your product does, and why anyone should care." },
  { title: "Conversion", tint: "bg-[#F6E8F8]", dot: "bg-[#B85CC4]", desc: "Calls to action, forms, and the small decisions between a visitor landing and converting." },
];

const steps = [
  { no: "1", title: "Paste your URL", desc: "Drop in your homepage — no account, no install, no tracking script to add." },
  { no: "2", title: "AI inspects your site", desc: "We crawl your pages and run them through all six checks, the same way a human auditor would — just in under a minute." },
  { no: "3", title: "Get your action plan", desc: "A free preview shows the headline issues. Unlock the full PDF report with prioritized fixes for €8." },
];

const testimonials = [
  { quote: "Found a slow-loading hero image we'd never have caught ourselves. Fixed it in a day.", tag: "E-commerce" },
  { quote: "The report read like something we'd have paid a consultant $500 for. Genuinely useful, not generic advice.", tag: "SaaS" },
  { quote: "Caught 3 pages with duplicate title tags we didn't know existed. Small fix, real SEO impact.", tag: "Agency" },
  { quote: "Clear priorities instead of a wall of jargon. We knew exactly what to fix first.", tag: "Startup" },
  { quote: "Ran it before and after a redesign — the score jump was a nice sanity check.", tag: "Freelancer" },
  { quote: "Accessibility issues we'd genuinely missed for months. Worth the €8 alone.", tag: "Nonprofit" },
];

const faqs = [
  { q: "Do I need to create an account?", a: "No. Paste your URL and get a free preview instantly — no signup, no email required." },
  { q: "How long does an audit take?", a: "Under 60 seconds for most sites. Larger, image-heavy pages may take a little longer." },
  { q: "What do I get with the full report?", a: "A detailed email report plus a downloadable PDF: scores for all six areas, every issue we found, three ways to fix each one, industry benchmarks and a prioritized action plan." },
  { q: "Can I re-run the audit after fixing issues?", a: "Yes — re-run anytime to see your updated score and confirm the fixes worked." },
];

const loadingSteps = [
  "Connecting to your website...",
  "Reading your sitemap...",
  "Analyzing pages in detail...",
  "Running AI audit across 6 areas...",
  "Almost done...",
];

const heroTasks = [
  { label: "Compress hero image (LCP 4.2s)", tag: "Performance", tagClass: "bg-[#FDF1DC] text-[#9A6412]", prio: "High", prioClass: "bg-[#FDE5E8] text-[#C23A4C]", done: false },
  { label: "Add alt text to 6 product images", tag: "Accessibility", tagClass: "bg-[#E4F0FB] text-[#2F6FB3]", prio: "Medium", prioClass: "bg-[#FDF1DC] text-[#9A6412]", done: false },
  { label: "Unique title tags on /shop and /about", tag: "SEO", tagClass: "bg-[#E3F3EB] text-[#2E7556]", prio: "Medium", prioClass: "bg-[#FDF1DC] text-[#9A6412]", done: false },
  { label: "Keep action-driven CTA copy", tag: "Copywriting", tagClass: "bg-[#FFE9E7] text-[#C2463F]", prio: "Low", prioClass: "bg-[#E3F3EB] text-[#2E7556]", done: true },
];

function scoreTone(score: number) {
  if (score >= 75) return { fg: "#3E8F6C", bg: "#E3F3EB", label: "Strong" };
  if (score >= 50) return { fg: "#B7791F", bg: "#FDF1DC", label: "Needs work" };
  return { fg: "#D63C4F", bg: "#FDE5E8", label: "Critical" };
}

function LogoMark() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      <i className="block h-[9px] w-[9px] rounded-full bg-[#F06A6A]" />
      <i className="block h-[9px] w-[9px] rounded-full bg-[#796EFF]" />
      <i className="block h-[9px] w-[9px] rounded-full bg-[#1E1F21]" />
    </span>
  );
}

function CheckCircle({ done }: { done?: boolean }) {
  return done ? (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#3E8F6C] text-[10px] text-white">✓</span>
  ) : (
    <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-[#C7C4C4]" />
  );
}

function SectionIntro({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="reveal mb-12 max-w-[680px]">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F06A6A]">{eyebrow}</p>
      <h2 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[46px]">{title}</h2>
      {desc && <p className="mt-4 text-[17px] leading-[1.6] text-[#6D6E6F]">{desc}</p>}
    </div>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-[#F06A6A] px-6 font-semibold text-white transition-colors hover:bg-[#E05555] active:bg-[#D14A4A] disabled:cursor-not-allowed disabled:opacity-60";
const btnSecondary =
  "inline-flex items-center justify-center rounded-full border border-[#1E1F21] bg-white px-6 font-semibold text-[#1E1F21] transition-colors hover:bg-[#F6F5F4]";

export default function Home() {
  const [url, setUrl] = useState("https://");
  const [auditId, setAuditId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const auditFormRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      loadingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isLoading]);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function handleInspect() {
    if (!url.trim() || url.trim() === "https://") {
      setError("Please enter a website URL.");
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The website could not be inspected.");
      }

      setResult(data);
      setAuditId(data.auditId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckout() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!url.trim() || url.trim() === "https://") {
      setError("Please enter a website URL.");
      return;
    }

    if (!auditId) {
      setError("Please inspect your website first.");
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;

    setIsCheckingOut(true);
    setError("");

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url: normalizedUrl, auditId }),
      });

      if (!response.ok) throw new Error("Checkout session could not be created.");
      const data = await response.json();
      if (!data.url) throw new Error("Stripe checkout URL is missing.");
      window.location.href = data.url;
    } catch {
      setError("Checkout could not be opened. Please try again.");
      setIsCheckingOut(false);
    }
  }

  function scrollToAudit() {
    auditFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      auditFormRef.current?.querySelector("input")?.focus();
    }, 550);
  }

  const resultTone = result ? scoreTone(result.score) : null;

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#1E1F21]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#EDEAE9] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.02em]">
            <LogoMark />
            Page Inspector
          </a>
          <div className="hidden items-center gap-8 text-[15px] font-medium text-[#1E1F21] md:flex">
            <a href="#inspect" className="transition-colors hover:text-[#F06A6A]">What we inspect</a>
            <a href="#how" className="transition-colors hover:text-[#F06A6A]">How it works</a>
            <a href="#report" className="transition-colors hover:text-[#F06A6A]">Sample report</a>
            <a href="#pricing" className="transition-colors hover:text-[#F06A6A]">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-[#F06A6A]">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:support@page-inspector.com" className="hidden text-[15px] font-medium transition-colors hover:text-[#F06A6A] sm:block">
              Support
            </a>
            <button type="button" onClick={scrollToAudit} className={`${btnPrimary} h-10 px-5 text-[14.5px]`}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-[#FFF4F2] to-white" />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-16 sm:px-8 sm:pt-24" ref={auditFormRef}>
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#6D6E6F] shadow-[0_1px_3px_rgba(30,31,33,0.08)]">
                <i className="block h-1.5 w-1.5 rounded-full bg-[#F06A6A]" />
                AI-powered website audits
              </p>

              <h1 className="mt-6 text-[42px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[64px]">
                Find what&rsquo;s holding your website back.
              </h1>

              <p className="mt-6 max-w-[500px] text-[18px] leading-[1.6] text-[#6D6E6F]">
                Get a clear audit of the biggest problems hurting your traffic, conversions and user experience — and a prioritized plan to fix them.
              </p>

              <div className="mt-8 flex max-w-[540px] flex-col gap-2 rounded-[20px] bg-white p-2 shadow-[0_2px_4px_rgba(30,31,33,0.04),0_12px_32px_rgba(30,31,33,0.10)] ring-1 ring-[#EDEAE9] sm:flex-row sm:rounded-full">
                <label htmlFor="audit-url" className="sr-only">Website URL</label>
                <input
                  id="audit-url"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInspect()}
                  className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 text-[16px] outline-none placeholder:text-[#A2A0A2]"
                />
                <button
                  type="button"
                  onClick={handleInspect}
                  disabled={isLoading}
                  className={`${btnPrimary} h-12 shrink-0 text-[15.5px]`}
                >
                  {isLoading ? "Inspecting..." : "Inspect website"}
                </button>
              </div>

              {error && <p className="mt-3 text-sm font-medium text-[#D63C4F]">{error}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#6D6E6F]">
                <span className="flex items-center gap-2"><span className="text-[#3E8F6C]">✓</span>No signup required</span>
                <span className="flex items-center gap-2"><span className="text-[#3E8F6C]">✓</span>Free preview</span>
                <span className="flex items-center gap-2"><span className="text-[#3E8F6C]">✓</span>Full PDF report for €8</span>
              </div>
            </div>

            {/* Signature element: audit as a task list */}
            <div className="relative">
              <div className="absolute -right-8 -top-8 hidden h-40 w-40 rounded-[32px] bg-[#EEECFF] lg:block" />
              <div className="absolute -bottom-8 -left-8 hidden h-32 w-32 rounded-full bg-[#FDF1DC] lg:block" />
              <div className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_4px_8px_rgba(30,31,33,0.04),0_24px_56px_rgba(30,31,33,0.14)] ring-1 ring-[#EDEAE9]">
                <div className="flex items-center justify-between border-b border-[#EDEAE9] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F06A6A] text-[13px] font-bold text-white">PI</span>
                    <div>
                      <p className="text-[14.5px] font-semibold leading-tight">Audit · yourwebsite.com</p>
                      <p className="text-[12px] text-[#6D6E6F]">Action plan · 4 tasks</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FDF1DC] px-3 py-1 text-[12.5px] font-bold text-[#9A6412]">62 / 100</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] border-b border-[#EDEAE9] bg-[#F9F8F8] px-5 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-[#6D6E6F]">
                  <span>Task</span>
                  <span>Priority</span>
                </div>

                <ul>
                  {heroTasks.map((t, i) => (
                    <li
                      key={t.label}
                      className="animate-pin-in flex items-center gap-3 border-b border-[#EDEAE9] px-5 py-3.5 last:border-b-0"
                      style={{ animationDelay: `${0.5 + i * 0.25}s` }}
                    >
                      <CheckCircle done={t.done} />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[14px] font-medium ${t.done ? "text-[#A2A0A2] line-through" : ""}`}>{t.label}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.tagClass}`}>{t.tag}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${t.prioClass}`}>{t.prio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {isLoading && (
            <div ref={loadingRef} className="mx-auto mt-14 max-w-[560px] rounded-[20px] bg-white p-7 shadow-[0_4px_8px_rgba(30,31,33,0.04),0_24px_56px_rgba(30,31,33,0.12)] ring-1 ring-[#EDEAE9] sm:p-8">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFE9E7]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#F06A6A]/20" />
                  <span className="relative block h-3 w-3 rounded-full bg-[#F06A6A]" />
                </div>
                <div>
                  <p className="text-[18px] font-bold tracking-[-0.01em]">Inspecting your website</p>
                  <p className="mt-0.5 text-[14px] text-[#6D6E6F]">This usually takes 20–40 seconds</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {loadingSteps.map((step, i) => {
                  const isDone = i < loadingStepIndex;
                  const isCurrent = i === loadingStepIndex;
                  return (
                    <div key={step} className="flex items-center gap-3 text-[14.5px]">
                      {isDone ? (
                        <CheckCircle done />
                      ) : (
                        <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${isCurrent ? "border-[#F06A6A]" : "border-[#D9D6D5]"}`}>
                          {isCurrent && <span className="block h-2 w-2 animate-pulse-slow rounded-full bg-[#F06A6A]" />}
                        </span>
                      )}
                      <span className={isCurrent ? "font-semibold" : isDone ? "" : "text-[#6D6E6F]"}>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#F1EFEE]">
                <div
                  className="h-full rounded-full bg-[#F06A6A] transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {result && resultTone && (
            <div ref={resultRef} className="reveal in-view mx-auto mt-14 max-w-[760px] scroll-mt-24 rounded-[24px] bg-white p-6 shadow-[0_4px_8px_rgba(30,31,33,0.04),0_24px_56px_rgba(30,31,33,0.12)] ring-1 ring-[#EDEAE9] sm:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6D6E6F]">Your free preview</p>
                  <h2 className="mt-2 break-all text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">
                    {result.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </h2>
                  <span className="mt-3 inline-block rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: resultTone.bg, color: resultTone.fg }}>
                    {resultTone.label}
                  </span>
                </div>
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(${resultTone.fg} ${result.score * 3.6}deg, #F1EFEE 0deg)` }}
                >
                  <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-[32px] font-bold leading-none tracking-[-0.03em]">{result.score}</span>
                    <span className="mt-1 text-[11px] text-[#6D6E6F]">out of 100</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 divide-y divide-[#EDEAE9] rounded-2xl ring-1 ring-[#EDEAE9]">
                {[
                  { label: "SEO", text: result.preview.seo, cls: "bg-[#E3F3EB] text-[#2E7556]" },
                  { label: "User experience", text: result.preview.ux, cls: "bg-[#EEECFF] text-[#5B50D6]" },
                  { label: "Performance", text: result.preview.performance, cls: "bg-[#FDF1DC] text-[#9A6412]" },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-2 p-4 sm:flex-row sm:gap-4 sm:p-5">
                    <span className={`h-fit w-fit shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold sm:w-[130px] sm:text-center ${row.cls}`}>{row.label}</span>
                    <p className="text-[15px] leading-[1.6]">{row.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[#FFF4F2] p-5 sm:p-6">
                <p className="text-[18px] font-bold tracking-[-0.01em]">Unlock the full report</p>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-[#6D6E6F]">
                  Every issue across all six areas, three ways to fix each one, industry benchmarks and a prioritized action plan — delivered to your inbox as an email and a PDF.
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <label htmlFor="checkout-email" className="sr-only">Email address</label>
                  <input
                    id="checkout-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 min-w-0 flex-1 rounded-full bg-white px-5 text-[16px] outline-none ring-1 ring-[#E0DDDC] transition-shadow focus:ring-2 focus:ring-[#F06A6A]"
                  />
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`${btnPrimary} h-12 text-[15px]`}
                  >
                    {isCheckingOut ? "Redirecting..." : "Unlock full report · €8"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* STRIP */}
      <div className="border-y border-[#EDEAE9] bg-[#F9F8F8]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-5 py-6 text-[14.5px] font-medium sm:grid-cols-3 sm:px-8">
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#F06A6A]" />Results in under 60 seconds</span>
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#796EFF]" />Checked against real audit criteria</span>
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#3E8F6C]" />One report, six essential areas</span>
        </div>
      </div>

      {/* WHAT WE INSPECT */}
      <section id="inspect" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <SectionIntro
          eyebrow="What we inspect"
          title="One audit. Six essential areas."
          desc="Every scan runs the same six checks a good consultant would — just faster, and without the invoice."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <article key={c.title} className={`reveal rounded-[20px] p-7 ${c.tint}`}>
              <span className={`block h-3 w-3 rounded-full ${c.dot}`} />
              <h3 className="mt-6 text-[20px] font-bold tracking-[-0.015em]">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#4B4C4E]">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 bg-[#F9F8F8]">
        <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-28">
          <SectionIntro eyebrow="How it works" title="From URL to action plan in three steps" />

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.no} className="reveal rounded-[20px] bg-white p-7 ring-1 ring-[#EDEAE9]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E1F21] text-[15px] font-bold text-white">{s.no}</span>
                <h3 className="mt-6 text-[20px] font-bold tracking-[-0.015em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#6D6E6F]">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SAMPLE REPORT */}
      <section id="report" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <SectionIntro
          eyebrow="Sample report"
          title="What you actually get"
          desc="A real breakdown with a plan you can work through — not a vague “improve your SEO” checklist."
        />

        <div className="reveal grid grid-cols-1 gap-10 rounded-[28px] bg-[#FFF4F2] p-6 sm:p-10 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[20px] bg-white p-7 ring-1 ring-[#F3E3E0]">
            <div className="relative mx-auto flex h-[150px] w-[150px] items-center justify-center">
              <svg width="150" height="150" className="-rotate-90" aria-hidden>
                <circle cx="75" cy="75" r="64" stroke="#F1EFEE" strokeWidth="13" fill="none" />
                <circle cx="75" cy="75" r="64" stroke="#B7791F" strokeWidth="13" fill="none" strokeDasharray="402" strokeDashoffset="153" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[38px] font-bold leading-none tracking-[-0.03em]">62</span>
                <span className="mt-1 text-[11.5px] text-[#6D6E6F]">out of 100</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              {[
                { label: "UX", value: 70, color: "#B7791F" },
                { label: "SEO", value: 55, color: "#B7791F" },
                { label: "Performance", value: 41, color: "#D63C4F" },
                { label: "Copy", value: 79, color: "#3E8F6C" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3 text-[13px] font-medium">
                  <span className="w-[84px]">{m.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1EFEE]">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                  <span className="w-6 text-right font-semibold" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { badge: "Critical", cls: "bg-[#FDE5E8] text-[#C23A4C]", title: "Largest Contentful Paint is 4.2s", desc: "Visitors on mobile wait nearly twice the recommended time before your homepage looks loaded. Compress your hero image and defer offscreen scripts." },
              { badge: "Warning", cls: "bg-[#FDF1DC] text-[#9A6412]", title: "6 images missing alt text", desc: "These are invisible to screen readers and to Google Images. Add short, descriptive alt text to each." },
              { badge: "Good", cls: "bg-[#E3F3EB] text-[#2E7556]", title: "Clear, action-driven CTA copy", desc: "“Inspect website” tells visitors exactly what happens next — keep this pattern across the site." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-[18px] bg-white p-5 ring-1 ring-[#F3E3E0]">
                <span className={`mt-0.5 w-[72px] shrink-0 rounded-full py-1 text-center text-[11.5px] font-semibold ${f.cls}`}>{f.badge}</span>
                <div>
                  <h4 className="text-[16px] font-semibold tracking-[-0.01em]">{f.title}</h4>
                  <p className="mt-1 text-[14.5px] leading-[1.55] text-[#6D6E6F]">{f.desc}</p>
                </div>
              </div>
            ))}
            <p className="mt-2 flex items-center gap-2 px-1 text-[14px] text-[#6D6E6F]">
              <span aria-hidden>📎</span> Every full report also comes as a polished PDF you can share with your team.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#F9F8F8] py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <SectionIntro eyebrow="Early feedback" title="What early users are saying" />
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#F9F8F8] to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#F9F8F8] to-transparent sm:w-32" />

          <div className="flex w-max animate-marquee gap-4 px-5">
            {[...testimonials, ...testimonials].map((t, i) => (
              <figure key={i} className="w-[290px] shrink-0 rounded-[20px] bg-white p-6 ring-1 ring-[#EDEAE9] sm:w-[340px]">
                <blockquote className="text-[15.5px] leading-[1.6]">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-[13px] font-semibold text-[#6D6E6F]">Early user · {t.tag}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <SectionIntro eyebrow="Pricing" title="Try it free. Pay only for the full picture." />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="reveal flex flex-col rounded-[24px] bg-white p-8 ring-1 ring-[#EDEAE9] sm:p-10">
            <h3 className="text-[20px] font-bold">Free preview</h3>
            <p className="mt-3 text-[48px] font-bold tracking-[-0.03em]">€0</p>
            <ul className="my-7 flex flex-1 flex-col gap-3 text-[15.5px]">
              <li className="flex gap-3"><span className="text-[#3E8F6C]">✓</span>Overall score for your site</li>
              <li className="flex gap-3"><span className="text-[#3E8F6C]">✓</span>Top 3 findings, headline only</li>
              <li className="flex gap-3"><span className="text-[#3E8F6C]">✓</span>No signup required</li>
            </ul>
            <button type="button" onClick={scrollToAudit} className={`${btnSecondary} h-12 text-[15.5px]`}>
              Run free preview
            </button>
          </div>

          <div className="reveal relative flex flex-col rounded-[24px] bg-[#1E1F21] p-8 text-white sm:p-10">
            <span className="absolute right-8 top-8 rounded-full bg-[#F06A6A] px-3 py-1 text-[12px] font-semibold">Recommended</span>
            <h3 className="text-[20px] font-bold">Full report</h3>
            <p className="mt-3 text-[48px] font-bold tracking-[-0.03em]">
              €8 <span className="text-[16px] font-medium tracking-normal text-white/60">one-time</span>
            </p>
            <ul className="my-7 flex flex-1 flex-col gap-3 text-[15.5px] text-white/90">
              <li className="flex gap-3"><span className="text-[#F06A6A]">✓</span>Every finding across all 6 areas</li>
              <li className="flex gap-3"><span className="text-[#F06A6A]">✓</span>Three ways to fix each problem</li>
              <li className="flex gap-3"><span className="text-[#F06A6A]">✓</span>Prioritized action plan + industry benchmarks</li>
              <li className="flex gap-3"><span className="text-[#F06A6A]">✓</span>Downloadable PDF report</li>
            </ul>
            <button type="button" onClick={scrollToAudit} className={`${btnPrimary} h-12 text-[15.5px]`}>
              Unlock full report
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-[#F9F8F8]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1.4fr]">
          <SectionIntro eyebrow="FAQ" title="Questions, answered" />

          <div className="reveal">
            {faqs.map((item, i) => (
              <div key={item.q} className="border-b border-[#E0DDDC] py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-5 text-left"
                >
                  <span className="text-[17.5px] font-semibold tracking-[-0.01em]">{item.q}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[20px] ring-1 ring-[#E0DDDC] transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === i ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[600px] pb-1 text-[15.5px] leading-[1.6] text-[#6D6E6F]">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <div className="reveal relative overflow-hidden rounded-[32px] bg-[#FFE9E7] px-7 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#F06A6A]/15" />
          <div className="pointer-events-none absolute -bottom-12 -right-6 h-48 w-48 rounded-[40px] bg-[#796EFF]/12" />
          <h2 className="relative mx-auto max-w-[680px] text-[32px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[48px]">
            See what your website could be doing better.
          </h2>
          <p className="relative mt-4 text-[17px] text-[#6D6E6F]">Free preview in under a minute. Full report for €8.</p>
          <button type="button" onClick={scrollToAudit} className={`${btnPrimary} relative mt-8 h-[52px] px-8 text-[16px]`}>
            Inspect your website
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#EDEAE9]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-10 text-[14px] text-[#6D6E6F] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="flex items-center gap-2.5 font-semibold text-[#1E1F21]"><LogoMark /> Page Inspector <span className="font-normal text-[#6D6E6F]">© 2026</span></span>
          <div className="flex gap-6 font-medium">
            <a href="/privacy" className="transition-colors hover:text-[#1E1F21]">Privacy policy</a>
            <a href="/terms" className="transition-colors hover:text-[#1E1F21]">Terms of use</a>
            <a href="mailto:support@page-inspector.com" className="transition-colors hover:text-[#1E1F21]">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
