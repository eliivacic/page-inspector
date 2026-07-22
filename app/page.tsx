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
  { no: "01", title: "User experience", icon: "🧭", chip: "bg-[#E7DBFA]", desc: "How visitors actually move through your site — navigation, clarity, and friction points that make people leave." },
  { no: "02", title: "SEO", icon: "🔎", chip: "bg-[#B9EBD3]", desc: "Titles, headings and structure — what's keeping search engines from understanding your pages." },
  { no: "03", title: "Performance", icon: "⚡", chip: "bg-[#FFE6CE]", desc: "Load times and technical drag that cost you visitors before they even see the page." },
  { no: "04", title: "Accessibility", icon: "♿", chip: "bg-[#FFF1BE]", desc: "Contrast, labels and structure — so the site works for every visitor, not just the ones it was tested on." },
  { no: "05", title: "Copywriting", icon: "✍️", chip: "bg-[#FFDAD1]", desc: "Whether your headlines actually say what your product does, and why anyone should care." },
  { no: "06", title: "Conversion", icon: "🎯", chip: "bg-[#D9C8F5]", desc: "Calls to action, forms, and the small decisions between a visitor landing and converting." },
];

const steps = [
  { no: "01", title: "Paste your URL", desc: "Drop in your homepage — no account, no install, no tracking script to add." },
  { no: "02", title: "AI inspects your site", desc: "We crawl the page and run it through all six checks, the same way a human auditor would — just in under a minute." },
  { no: "03", title: "Get your report", desc: "A free preview shows the headline issues. Unlock the full breakdown with fix-it steps for €8." },
];

const faqs = [
  { q: "Do I need to create an account?", a: "No. Paste your URL and get a free preview instantly — no signup, no email required." },
  { q: "How long does an audit take?", a: "Under 60 seconds for most sites. Larger, image-heavy pages may take a little longer." },
  { q: "What counts as one audit?", a: "One audit covers a single URL across all six areas. To check multiple pages, run a separate audit for each." },
  { q: "Can I re-run the audit after fixing issues?", a: "Yes — re-run anytime to see your updated score and confirm the fixes worked." },
];

const loadingSteps = [
  "Connecting to your website...",
  "Reading your sitemap...",
  "Analyzing pages in detail...",
  "Running AI audit across 6 areas...",
  "Almost done...",
];

function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" fill="#E7DBFA" stroke="#18151A" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="6" fill="none" stroke="#18151A" strokeWidth="2" />
      <line x1="21.5" y1="21.5" x2="27" y2="27" stroke="#18151A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

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

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F1] text-[#18151A]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#F8F6F1]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4 sm:px-8">
          <div className="font-display flex items-center gap-2.5 text-[19px] font-semibold">
            <LogoMark />
            PAGE <span className="text-[#8B6FD9]">INSPECTOR</span>
          </div>
          <div className="hidden items-center gap-8 text-[14.5px] font-semibold md:flex">
            <a href="#inspect" className="opacity-75 transition-opacity hover:opacity-100">What we inspect</a>
            <a href="#how" className="opacity-75 transition-opacity hover:opacity-100">How it works</a>
            <a href="#report" className="opacity-75 transition-opacity hover:opacity-100">Sample report</a>
            <a href="#pricing" className="opacity-75 transition-opacity hover:opacity-100">Pricing</a>
            <a href="#faq" className="opacity-75 transition-opacity hover:opacity-100">FAQ</a>
          </div>
          <a
            href="mailto:support@page-inspector.com"
            className="font-mono-utility rounded-xl border-[1.5px] border-[#18151A] bg-white px-[18px] py-2.5 text-[8px] font-semibold text-[#18151A] shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A]"
          >
            support@page-inspector.com
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-[1160px] px-6 pb-10 pt-16 sm:px-8 sm:pt-20" ref={auditFormRef} id="top">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="font-mono-utility inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#18151A] bg-[#E7DBFA] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
              🔍 AI-powered website analysis
            </span>

            <h1 className="font-display mt-5 text-[38px] font-semibold leading-[1.08] tracking-[-0.01em] sm:text-[58px]">
              Find what is
              <br />
              <span className="inline-block -rotate-2 rounded-lg bg-[#FFD84D] px-2.5 py-0.5 shadow-[2px_2px_0_#18151A]">
                holding
              </span>{" "}
              your website back
            </h1>

            <p className="mt-5 max-w-[480px] text-[18px] leading-[1.55] text-[#5B5560]">
              Get a clear, AI-powered audit that uncovers the biggest problems
              affecting your traffic, conversions and user experience — plus
              practical steps to fix them.
            </p>

            <div className="mt-7 flex max-w-[520px] gap-0 rounded-2xl border-[1.5px] border-[#18151A] bg-white p-1.5 shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]">
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInspect()}
                className="font-mono-utility h-[52px] min-w-0 flex-1 bg-transparent px-3.5 text-[14.5px] outline-none placeholder:text-[#A39CAE]"
              />
              <button
                type="button"
                onClick={handleInspect}
                disabled={isLoading}
                className="shrink-0 rounded-xl border-[1.5px] border-[#18151A] bg-[#FFD84D] px-[22px] text-[15px] font-bold text-[#18151A] shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Inspecting..." : "Inspect website"}
              </button>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-[#5B5560]">
              <span className="flex items-center gap-1.5"><i className="h-[5px] w-[5px] rounded-full bg-[#3FAE7C]" />No signup required</span>
              <span className="flex items-center gap-1.5"><i className="h-[5px] w-[5px] rounded-full bg-[#3FAE7C]" />Free preview</span>
              <span className="flex items-center gap-1.5"><i className="h-[5px] w-[5px] rounded-full bg-[#3FAE7C]" />Full report for €8</span>
            </div>
          </div>

          {/* Signature element: animated browser mockup */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-[#18151A] bg-white shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)]">
              <div className="flex items-center gap-2 border-b-[1.5px] border-black/10 bg-[#F2EBFC] px-3.5 py-3">
                <div className="flex gap-1.5">
                  <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
                  <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
                  <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
                </div>
                <div className="font-mono-utility flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#5B5560]">
                  yourwebsite.com
                </div>
              </div>

              <div className="browser-body-bg relative h-[360px] overflow-hidden p-5">
                <div className="animate-scan absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#8B6FD9] to-transparent shadow-[0_0_16px_2px_rgba(139,111,217,0.6)]" />
                <div className="mb-3.5 h-[22px] w-[55%] rounded-lg bg-[#EFEAF7]" />
                <div className="mb-3.5 h-3 w-[90%] rounded-lg bg-[#EFEAF7]" />
                <div className="mb-3.5 h-3 w-[78%] rounded-lg bg-[#EFEAF7]" />
                <div className="mb-3.5 h-[110px] w-full rounded-lg bg-gradient-to-br from-[#FFE6CE] to-[#E7DBFA]" />
                <div className="h-3 w-[60%] rounded-lg bg-[#EFEAF7]" />

                <div className="animate-pin-in absolute right-[-14px] top-[38px] flex items-center gap-1.5 rounded-full border-[1.5px] border-[#18151A] bg-[#FFDAD1] py-[5px] pl-[5px] pr-[11px] shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]" style={{ animationDelay: "1.1s" }}>
                  <span className="font-mono-utility flex h-5 w-5 items-center justify-center rounded-full bg-[#FF8B76] text-[11px] text-white">!</span>
                  <span className="font-mono-utility text-[12px] font-semibold">Slow LCP: 4.2s</span>
                </div>
                <div className="animate-pin-in absolute left-[-18px] top-[150px] flex items-center gap-1.5 rounded-full border-[1.5px] border-[#18151A] bg-[#FFF1BE] py-[5px] pl-[5px] pr-[11px] shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]" style={{ animationDelay: "1.6s" }}>
                  <span className="font-mono-utility flex h-5 w-5 items-center justify-center rounded-full bg-[#E0A800] text-[11px] text-white">6</span>
                  <span className="font-mono-utility text-[12px] font-semibold">Missing alt text</span>
                </div>
                <div className="animate-pin-in absolute bottom-[26px] right-[10px] flex items-center gap-1.5 rounded-full border-[1.5px] border-[#18151A] bg-[#B9EBD3] py-[5px] pl-[5px] pr-[11px] shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]" style={{ animationDelay: "2.1s" }}>
                  <span className="font-mono-utility flex h-5 w-5 items-center justify-center rounded-full bg-[#3FAE7C] text-[11px] text-white">✓</span>
                  <span className="font-mono-utility text-[12px] font-semibold">Strong CTA copy</span>
                </div>
              </div>
            </div>

            <div className="animate-bob font-mono-utility absolute -top-4 left-5 rounded-lg bg-[#18151A] px-2.5 py-1.5 text-[11px] font-semibold text-[#F8F6F1]">
              score: 62/100
            </div>
          </div>
        </div>

        {isLoading && (
          <div ref={loadingRef} className="mx-auto mt-12 max-w-[560px] rounded-2xl border-[1.5px] border-[#18151A] bg-white p-7 shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)] sm:p-8">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#18151A] bg-[#E7DBFA]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#8B6FD9]/30" />
                <span className="relative text-2xl">🔍</span>
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Inspecting your website</p>
                <p className="mt-0.5 text-[13.5px] text-[#5B5560]">This usually takes 20–40 seconds</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {loadingSteps.map((step, i) => {
                const isDone = i < loadingStepIndex;
                const isCurrent = i === loadingStepIndex;
                return (
                  <div key={step} className="flex items-center gap-3 text-[14px]">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors ${
                        isDone
                          ? "bg-[#B9EBD3] text-[#1E6B48]"
                          : isCurrent
                          ? "border-[1.5px] border-[#8B6FD9]"
                          : "border-[1.5px] border-black/15"
                      }`}
                    >
                      {isDone ? "✓" : isCurrent ? (
                        <span className="block h-2 w-2 animate-pulse-slow rounded-full bg-[#8B6FD9]" />
                      ) : null}
                    </span>
                    <span className={isDone ? "text-[#18151A]" : isCurrent ? "font-semibold text-[#18151A]" : "text-[#5B5560]"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-[#8B6FD9] transition-all duration-700 ease-out"
                style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="reveal in-view mx-auto mt-12 max-w-[760px] scroll-mt-24 rounded-2xl border-[1.5px] border-[#18151A] bg-white p-6 shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono-utility text-xs font-semibold uppercase tracking-wide text-[#5B5560]">Website inspected</p>
                <h2 className="font-display mt-2 text-4xl font-semibold">Score: {result.score}/100</h2>
                <p className="mt-2 break-all text-sm text-[#5B5560]">Preview audit for: {result.website}</p>
              </div>
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(#8B6FD9 ${result.score * 3.6}deg, #ECE4F8 0deg)` }}
              >
                <div className="font-display absolute inset-[7px] flex items-center justify-center rounded-full bg-white text-2xl font-semibold">
                  {result.score}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t-[1.5px] border-[#18151A] pt-6">
              <h3 className="font-display text-xl font-semibold">Your free preview</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border-[1.5px] border-[#18151A] bg-[#FFF1BE] p-4">
                  <p className="font-mono-utility text-xs font-bold uppercase tracking-wide">SEO</p>
                  <p className="mt-2 text-sm leading-6">{result.preview.seo}</p>
                </div>
                <div className="rounded-xl border-[1.5px] border-[#18151A] bg-[#FFF1BE] p-4">
                  <p className="font-mono-utility text-xs font-bold uppercase tracking-wide">User experience</p>
                  <p className="mt-2 text-sm leading-6">{result.preview.ux}</p>
                </div>
                <div className="rounded-xl border-[1.5px] border-[#18151A] bg-[#FFF1BE] p-4">
                  <p className="font-mono-utility text-xs font-bold uppercase tracking-wide">Performance</p>
                  <p className="mt-2 text-sm leading-6">{result.preview.performance}</p>
                </div>
              </div>

              <p className="mt-6 text-[15px] leading-6">
                Enter your email to unlock the full report and receive all recommendations after payment.
              </p>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-5 h-12 w-full rounded-lg border-[1.5px] border-[#18151A] bg-white px-4 text-base outline-none transition-shadow focus:shadow-[3px_3px_0_#18151A]"
              />
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="mt-3 inline-flex h-12 items-center justify-center rounded-lg border-[1.5px] border-[#18151A] bg-[#FFD84D] px-6 text-[14px] font-bold shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? "Redirecting..." : "Unlock full report · €8"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* STRIP */}
      <div className="border-y-[1.5px] border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-6 px-6 py-[22px] text-[13px] font-semibold sm:px-8">
          <span className="flex items-center gap-2">⚡ Results in under 60 seconds</span>
          <span className="flex items-center gap-2">🧠 Powered by AI, checked against real audit criteria</span>
          <span className="flex items-center gap-2">📄 One report, six essential areas</span>
        </div>
      </div>

      {/* WHAT WE INSPECT */}
      <section id="inspect" className="mx-auto max-w-[1160px] px-6 py-24 sm:px-8">
        <div className="reveal mb-14 max-w-[640px]">
          <span className="font-mono-utility inline-flex rounded-full border-[1.5px] border-[#18151A] bg-[#E7DBFA] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
            What we inspect
          </span>
          <h2 className="font-display mt-[18px] text-[30px] font-semibold sm:text-[42px]">One audit. Six essential areas.</h2>
          <p className="mt-3.5 text-[17px] leading-[1.6] text-[#5B5560]">
            Every scan runs the same six checks a good consultant would — just faster, and without the invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <article key={c.title} className="reveal relative overflow-hidden rounded-[20px] border-[1.5px] border-[#18151A] bg-white p-[26px] shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)] transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)]">
              <span className="font-mono-utility absolute right-[22px] top-5 text-xs font-semibold text-[#18151A]/25">{c.no}</span>
              <div className={`mb-[18px] flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[#18151A] text-xl ${c.chip}`}>
                {c.icon}
              </div>
              <h3 className="font-display text-lg font-medium">{c.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.55] text-[#5B5560]">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y-[1.5px] border-black/10 bg-white">
        <div className="mx-auto max-w-[1160px] px-6 py-24 sm:px-8">
          <div className="reveal mb-14 max-w-[640px]">
            <span className="font-mono-utility inline-flex rounded-full border-[1.5px] border-[#18151A] bg-[#FFF1BE] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
              How it works
            </span>
            <h2 className="font-display mt-[18px] text-[30px] font-semibold sm:text-[42px]">From URL to report, in three steps</h2>
          </div>

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-3 sm:gap-0">
            {steps.map((s, i) => (
              <div key={s.no} className="reveal relative px-0 sm:px-[26px]">
                {i < steps.length - 1 && (
                  <span className="absolute -right-3.5 top-3.5 hidden text-2xl text-[#8B6FD9] sm:block">→</span>
                )}
                <div className="font-display text-[44px] font-semibold text-[#E7DBFA]" style={{ WebkitTextStroke: "1.5px #18151A" }}>
                  {s.no}
                </div>
                <h3 className="font-display mt-3.5 text-[19px] font-medium">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-[#5B5560]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE REPORT */}
      <section id="report" className="mx-auto max-w-[1160px] px-6 py-24 sm:px-8">
        <div className="reveal mb-14 max-w-[640px]">
          <span className="font-mono-utility inline-flex rounded-full border-[1.5px] border-[#18151A] bg-[#FFDAD1] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
            Sample report
          </span>
          <h2 className="font-display mt-[18px] text-[30px] font-semibold sm:text-[42px]">What you actually get</h2>
          <p className="mt-3.5 text-[17px] leading-[1.6] text-[#5B5560]">
            A real breakdown, not a vague &ldquo;improve your SEO&rdquo; checklist.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 gap-9 rounded-[24px] border-[1.5px] border-[#18151A] bg-white p-9 shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)] sm:grid-cols-[220px_1fr]">
          <div>
            <div className="relative mx-auto flex h-[150px] w-[150px] items-center justify-center">
              <svg width="150" height="150" className="-rotate-90">
                <circle cx="75" cy="75" r="64" stroke="rgba(24,21,26,0.08)" strokeWidth="14" fill="none" />
                <circle cx="75" cy="75" r="64" stroke="#8B6FD9" strokeWidth="14" fill="none" strokeDasharray="402" strokeDashoffset="153" strokeLinecap="round" />
              </svg>
              <div className="font-display absolute text-[36px] font-semibold">62</div>
            </div>
            <p className="font-mono-utility mt-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[#5B5560]">Overall score</p>

            <div className="mt-[22px] flex flex-col gap-2.5">
              {[
                { label: "UX", value: 70, color: "#3FAE7C" },
                { label: "SEO", value: 55, color: "#E0A800" },
                { label: "Perf", value: 41, color: "#FF8B76" },
                { label: "A11y", value: 66, color: "#3FAE7C" },
              ].map((m) => (
                <div key={m.label} className="font-mono-utility flex items-center gap-2.5 text-[12.5px] font-semibold">
                  <span className="w-9">{m.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded bg-black/[0.08]">
                    <div className="h-full rounded" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-3.5 rounded-2xl border-[1.5px] border-black/10 p-4">
              <span className="font-mono-utility mt-0.5 whitespace-nowrap rounded-full bg-[#FFDAD1] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#9C2E1B]">Critical</span>
              <div>
                <h4 className="text-[14.5px] font-semibold">Largest Contentful Paint is 4.2s</h4>
                <p className="mt-0.5 text-[13px] leading-[1.5] text-[#5B5560]">Visitors on mobile wait nearly twice the recommended time before your homepage looks loaded. Compress your hero image and defer offscreen scripts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 rounded-2xl border-[1.5px] border-black/10 p-4">
              <span className="font-mono-utility mt-0.5 whitespace-nowrap rounded-full bg-[#FFF1BE] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#8A6800]">Warning</span>
              <div>
                <h4 className="text-[14.5px] font-semibold">6 images missing alt text</h4>
                <p className="mt-0.5 text-[13px] leading-[1.5] text-[#5B5560]">These are invisible to screen readers and to Google Images. Add short, descriptive alt text to each.</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 rounded-2xl border-[1.5px] border-black/10 p-4">
              <span className="font-mono-utility mt-0.5 whitespace-nowrap rounded-full bg-[#B9EBD3] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#1E6B48]">Good</span>
              <div>
                <h4 className="text-[14.5px] font-semibold">Clear, action-driven CTA copy</h4>
                <p className="mt-0.5 text-[13px] leading-[1.5] text-[#5B5560]">&ldquo;Inspect website&rdquo; tells visitors exactly what happens next — keep this pattern across the site.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y-[1.5px] border-black/10 bg-white">
        <div className="mx-auto max-w-[1160px] px-6 py-24 sm:px-8">
          <div className="reveal mb-14 max-w-[640px]">
            <span className="font-mono-utility inline-flex rounded-full border-[1.5px] border-[#18151A] bg-[#FFDAD1] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
              Pricing
            </span>
            <h2 className="font-display mt-[18px] text-[30px] font-semibold sm:text-[42px]">Try it free. Pay only for the full picture.</h2>
          </div>

          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2">
            <div className="reveal flex flex-col rounded-[20px] border-[1.5px] border-[#18151A] bg-white p-8 shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]">
              <h3 className="font-display text-[19px] font-medium">Free preview</h3>
              <p className="font-display mt-2.5 text-[44px] font-semibold">€0</p>
              <ul className="my-[22px] flex flex-1 flex-col gap-[11px] text-[14.5px]">
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Overall score across all 6 areas</li>
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Top 3 issues, headline only</li>
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>No signup required</li>
              </ul>
              <button
                type="button"
                onClick={scrollToAudit}
                className="rounded-xl border-[1.5px] border-[#18151A] bg-white py-3.5 text-[15px] font-bold shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A]"
              >
                Run free preview
              </button>
            </div>

            <div className="reveal relative flex flex-col rounded-[20px] border-[1.5px] border-[#18151A] bg-[#E7DBFA] p-8 shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)]">
              <span className="font-mono-utility absolute -top-3 right-6 rotate-3 rounded-full border-[1.5px] border-[#18151A] bg-[#FFD84D] px-3.5 py-1 text-[11px] font-bold">Most useful</span>
              <h3 className="font-display text-[19px] font-medium">Full report</h3>
              <p className="font-display mt-2.5 text-[44px] font-semibold">€8 <span className="font-sans text-[15px] font-medium text-[#5B5560]">one-time</span></p>
              <ul className="my-[22px] flex flex-1 flex-col gap-[11px] text-[14.5px]">
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Every finding across all 6 areas</li>
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Practical, step-by-step fixes</li>
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Downloadable report</li>
                <li className="flex gap-2.5"><span className="text-[#3FAE7C]">✓</span>Re-run anytime after changes</li>
              </ul>
              <button
                type="button"
                onClick={scrollToAudit}
                className="rounded-xl border-[1.5px] border-[#18151A] bg-[#18151A] py-3.5 text-[15px] font-bold text-[#F8F6F1] shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A]"
              >
                Unlock full report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[1160px] px-6 py-24 sm:px-8">
        <div className="reveal mb-14 max-w-[640px]">
          <span className="font-mono-utility inline-flex rounded-full border-[1.5px] border-[#18151A] bg-[#D9C8F5] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
            FAQ
          </span>
          <h2 className="font-display mt-[18px] text-[30px] font-semibold sm:text-[42px]">Questions, answered</h2>
        </div>

        <div className="reveal max-w-[760px]">
          {faqs.map((item, i) => (
            <div key={item.q} className="border-b-[1.5px] border-black/[0.14] py-[22px]">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-5 text-left"
              >
                <span className="font-display text-[17px] font-medium">{item.q}</span>
                <span className={`shrink-0 text-[22px] text-[#8B6FD9] transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${openFaq === i ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="max-w-[600px] pb-1 text-[14.5px] leading-[1.6] text-[#5B5560]">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1160px] px-6 pb-24 sm:px-8">
        <div className="reveal relative overflow-hidden rounded-[28px] bg-[#18151A] px-8 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-36 h-[340px] w-[340px] rounded-full opacity-35" style={{ background: "radial-gradient(circle, #8B6FD9, transparent 70%)" }} />
          <h2 className="font-display relative text-[28px] font-semibold leading-tight text-[#F8F6F1] sm:text-[42px]">
            Get a complete website audit<br />in only one report
          </h2>
          <p className="relative mt-3.5 text-[16px] text-[#F8F6F1]/70">Free preview in under a minute. Full report for €8.</p>
          <button
            type="button"
            onClick={scrollToAudit}
            className="animate-cta-pulse relative mt-7 min-w-[154px] rounded-xl border-[1.5px] border-[#18151A] bg-[#FFD84D] px-8 py-3.5 text-[15px] font-bold"
          >
            Try now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#E7DBFA]">
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