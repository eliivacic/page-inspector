"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { faqs } from "@/lib/content";
import StructuredData from "./structured-data";

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
  { no: "2", title: "We inspect your pages", desc: "We follow your sitemap, read up to six of your key pages and check them against six areas — in about two minutes." },
  { no: "3", title: "Fix what matters first", desc: "See your score and top findings for free. Unlock the full report with step-by-step fixes and a prioritized action plan for €8." },
];

const problems = [
  { title: "Visitors leave before they understand you", desc: "A vague headline or a buried call to action can quietly cost you most of the people who land on your site." },
  { title: "Google can't tell what your pages are about", desc: "Duplicate titles, missing descriptions and weak structure keep you off the first page — even when your offer is good." },
  { title: "Small technical issues add up", desc: "Slow images, missing alt text and low-contrast buttons each seem minor. Together, they push people away." },
];

const standards = [
  { title: "Your real content, not a template", desc: "Every finding points to something we actually found on your pages — a specific heading, page or count — so you know exactly what to change." },
  { title: "Measured against recognized standards", desc: "We check against Google's search guidelines and Core Web Vitals thresholds, WCAG accessibility criteria and proven conversion practices." },
  { title: "More than your homepage", desc: "We read your sitemap and review up to six of your most important pages, so site-wide patterns don't slip through." },
  { title: "Nothing to install, nothing to share", desc: "We only read what is already public. No logins, no tracking code, no access to your site or analytics." },
];

const loadingSteps = [
  "Connecting to your website...",
  "Reading your sitemap...",
  "Reading your key pages...",
  "Checking all six areas...",
  "Writing up your findings...",
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
    }, 22000);

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
      <StructuredData />
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
              Free audit
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
                Website audit · SEO, UX, speed &amp; conversion
              </p>

              <h1 className="mt-6 text-[42px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[64px]">
                Find out what&rsquo;s costing your website customers.
              </h1>

              <p className="mt-6 max-w-[500px] text-[18px] leading-[1.6] text-[#6D6E6F]">
                Paste your URL and see the problems holding your site back — in search, usability, speed and conversion. Free preview in about two minutes, with a clear plan for what to fix first.
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
                  {isLoading ? "Inspecting..." : "Get my free audit"}
                </button>
              </div>

              {error && <p className="mt-3 text-sm font-medium text-[#D63C4F]">{error}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#6D6E6F]">
                <span className="flex items-center gap-2"><span aria-hidden className="text-[#3E8F6C]">✓</span>Free preview, no signup</span>
                <span className="flex items-center gap-2"><span aria-hidden className="text-[#3E8F6C]">✓</span>Nothing to install</span>
                <span className="flex items-center gap-2"><span aria-hidden className="text-[#3E8F6C]">✓</span>14-day money-back guarantee</span>
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
                  <p className="mt-0.5 text-[14px] text-[#6D6E6F]">This usually takes about two minutes — keep this tab open</p>
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
                  All six areas, every finding, three ways to fix each problem, industry benchmarks and a prioritized action plan — sent to your inbox as an email and a PDF.
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
                    {isCheckingOut ? "Redirecting..." : "Get the full report · €8"}
                  </button>
                </div>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#6D6E6F]">
                  <span><span aria-hidden>🔒 </span>Secure payment via Stripe</span>
                  <span><span aria-hidden>↩ </span>14-day money-back guarantee</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* STRIP */}
      <div className="border-y border-[#EDEAE9] bg-[#F9F8F8]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-5 py-6 text-[14.5px] font-medium sm:grid-cols-3 sm:px-8">
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#F06A6A]" />Free preview in about two minutes</span>
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#796EFF]" />Checked against Google and WCAG standards</span>
          <span className="flex items-center gap-3"><i className="block h-2 w-2 rounded-full bg-[#3E8F6C]" />14-day money-back guarantee</span>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="mx-auto max-w-[1200px] px-5 pt-24 sm:px-8 sm:pt-28">
        <SectionIntro
          eyebrow="Why it matters"
          title="Most websites lose customers to problems nobody notices."
          desc="You see your site every day, so the gaps become invisible. Your visitors notice them in seconds — and leave."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {problems.map((p, i) => (
            <article key={p.title} className="reveal rounded-[20px] p-7 ring-1 ring-[#EDEAE9]">
              <span className="text-[13px] font-semibold text-[#F06A6A]">0{i + 1}</span>
              <h3 className="mt-3 text-[20px] font-bold leading-[1.25] tracking-[-0.015em]">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#6D6E6F]">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* WHAT WE INSPECT */}
      <section id="inspect" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <SectionIntro
          eyebrow="What we inspect"
          title="One audit. Six essential areas."
          desc="The same six checks a good consultant would run — without the wait or the agency invoice."
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
          <SectionIntro eyebrow="How it works" title="From URL to action plan in three steps" desc="No calls, no onboarding, no access to your accounts." />

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
          title="We audited our own website. Here’s the unedited report."
          desc="The same report you get for €8 — scores, specific findings, three ways to fix each problem and a prioritized action plan. Nothing tidied up."
        />

        <div className="reveal grid grid-cols-1 items-center gap-10 rounded-[28px] bg-[#FFF4F2] p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { src: "/sample/cover.webp", alt: "Report cover with overall score and scores by area" },
              { src: "/sample/area.webp", alt: "Report page with SEO findings and three ways to fix them" },
              { src: "/sample/plan.webp", alt: "Action plan page with prioritized tasks" },
            ].map((img, i) => (
              <a
                key={img.src}
                href="/sample-report.pdf"
                target="_blank"
                rel="noopener"
                className={`block overflow-hidden rounded-[10px] bg-white shadow-[0_2px_4px_rgba(30,31,33,0.06),0_16px_36px_rgba(30,31,33,0.14)] ring-1 ring-[#F3E3E0] transition-transform duration-200 hover:-translate-y-1 ${i === 1 ? "sm:-translate-y-4 sm:hover:-translate-y-5" : ""}`}
              >
                <Image src={img.src} alt={img.alt} width={910} height={1287} className="h-auto w-full" sizes="(min-width: 1024px) 220px, 30vw" />
              </a>
            ))}
          </div>

          <div>
            <ul className="flex flex-col gap-3 text-[15.5px]">
              {[
                "Overall score and a score for each of the six areas",
                "24 findings tied to your actual pages and headings",
                "Quick, structural and long-term fix for every problem",
                "Industry benchmarks and a prioritized action plan",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-[#3E8F6C]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="/sample-report.pdf" target="_blank" rel="noopener" className={`${btnSecondary} h-12 text-[15px]`}>
                Download sample report (PDF)
              </a>
              <button type="button" onClick={scrollToAudit} className={`${btnPrimary} h-12 text-[15px]`}>
                Get my free audit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TRUST IT */}
      <section className="bg-[#F9F8F8]">
        <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-28">
          <SectionIntro
            eyebrow="Why you can rely on it"
            title="Specific findings you can act on today."
            desc="Generic checklists tell you to “improve your SEO”. Your report tells you which page, which heading and what to change."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {standards.map((t) => (
              <article key={t.title} className="reveal flex gap-4 rounded-[20px] bg-white p-7 ring-1 ring-[#EDEAE9]">
                <span aria-hidden className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E3F3EB] text-[13px] text-[#3E8F6C]">✓</span>
                <div>
                  <h3 className="text-[18px] font-bold tracking-[-0.01em]">{t.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.6] text-[#6D6E6F]">{t.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <SectionIntro eyebrow="Pricing" title="Try it free. Pay only for the full picture." desc="One-time payment. No subscription, no account, nothing to cancel." />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="reveal flex flex-col rounded-[24px] bg-white p-8 ring-1 ring-[#EDEAE9] sm:p-10">
            <h3 className="text-[20px] font-bold">Free preview</h3>
            <p className="mt-3 text-[48px] font-bold tracking-[-0.03em]">€0</p>
            <ul className="my-7 flex flex-1 flex-col gap-3 text-[15.5px]">
              <li className="flex gap-3"><span aria-hidden className="text-[#3E8F6C]">✓</span>Overall score for your site</li>
              <li className="flex gap-3"><span aria-hidden className="text-[#3E8F6C]">✓</span>Top finding for SEO, UX and performance</li>
              <li className="flex gap-3"><span aria-hidden className="text-[#3E8F6C]">✓</span>No signup, no card</li>
            </ul>
            <button type="button" onClick={scrollToAudit} className={`${btnSecondary} h-12 text-[15.5px]`}>
              Get my free audit
            </button>
          </div>

          <div className="reveal relative flex flex-col rounded-[24px] bg-[#1E1F21] p-8 text-white sm:p-10">
            <span className="absolute right-8 top-8 rounded-full bg-[#F06A6A] px-3 py-1 text-[12px] font-semibold">Recommended</span>
            <h3 className="text-[20px] font-bold">Full report</h3>
            <p className="mt-3 text-[48px] font-bold tracking-[-0.03em]">
              €8 <span className="text-[16px] font-medium tracking-normal text-white/60">one-time</span>
            </p>
            <ul className="my-7 flex flex-1 flex-col gap-3 text-[15.5px] text-white/90">
              <li className="flex gap-3"><span aria-hidden className="text-[#F06A6A]">✓</span>Scores and 24 specific findings across all 6 areas</li>
              <li className="flex gap-3"><span aria-hidden className="text-[#F06A6A]">✓</span>Three ways to fix each problem</li>
              <li className="flex gap-3"><span aria-hidden className="text-[#F06A6A]">✓</span>Prioritized action plan + industry benchmarks</li>
              <li className="flex gap-3"><span aria-hidden className="text-[#F06A6A]">✓</span>PDF to share with your team or developer</li>
            </ul>
            <button type="button" onClick={scrollToAudit} className={`${btnPrimary} h-12 text-[15.5px]`}>
              Start with the free audit
            </button>
            <p className="mt-4 text-center text-[13px] text-white/60"><span aria-hidden>🔒 </span>Secure payment via Stripe · 14-day money-back guarantee</p>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
        <div className="reveal flex flex-col gap-5 rounded-[24px] bg-[#E3F3EB] p-8 sm:flex-row sm:items-center sm:p-10">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[24px]" aria-hidden>↩</span>
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">Not useful? Get your money back.</h2>
            <p className="mt-1.5 max-w-[720px] text-[15.5px] leading-[1.6] text-[#2E4A3D]">
              If the full report doesn&rsquo;t help you improve your website, email{" "}
              <a href="mailto:support@page-inspector.com" className="font-semibold underline underline-offset-2">support@page-inspector.com</a>{" "}
              within 14 days and we&rsquo;ll refund the full €8. No forms, no questions.
            </p>
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
            Your next customer is already on your site. Make sure they stay.
          </h2>
          <p className="relative mt-4 text-[17px] text-[#6D6E6F]">Free preview in about two minutes. Full report for €8, with a 14-day money-back guarantee.</p>
          <button type="button" onClick={scrollToAudit} className={`${btnPrimary} relative mt-8 h-[52px] px-8 text-[16px]`}>
            Get my free audit
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#EDEAE9]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pt-10 text-[14px] text-[#6D6E6F] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="flex items-center gap-2.5 font-semibold text-[#1E1F21]"><LogoMark /> Page Inspector <span className="font-normal text-[#6D6E6F]">© 2026</span></span>
          <div className="flex gap-6 font-medium">
            <a href="/privacy" className="transition-colors hover:text-[#1E1F21]">Privacy policy</a>
            <a href="/terms" className="transition-colors hover:text-[#1E1F21]">Terms of use</a>
            <a href="mailto:support@page-inspector.com" className="transition-colors hover:text-[#1E1F21]">Support</a>
          </div>
        </div>
        <p className="mx-auto max-w-[1200px] px-5 pb-10 pt-4 text-[12.5px] leading-[1.6] text-[#8A898B] sm:px-8">
          Page Inspector is operated by VELORIA d.o.o., Rakuševa ulica 8, 1000 Ljubljana, Slovenia · Registration no. 7357974000 · Tax no. 89482786
        </p>
      </footer>
    </main>
  );
}
