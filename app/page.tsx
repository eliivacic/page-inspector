"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [showResult, setShowResult] = useState(false);

  const categories = [
    "User experience",
    "SEO",
    "Performance",
    "Accessibility",
    "Copywriting",
    "Conversion",
  ];

  function handleInspect() {
    setShowResult(true);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#2f3437]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <header className="flex items-center justify-between border-b border-[#e9e9e7] py-7">
          <a
            href="#"
            className="text-2xl font-bold tracking-[-0.04em] text-[#18392b] sm:text-3xl"
          >
            PageInspector
          </a>

          <span className="hidden text-sm text-[#787774] sm:block">
            AI website audit
          </span>
        </header>

        <section className="mx-auto max-w-4xl py-20 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-[#e7f0eb] px-3 py-1.5 text-sm font-medium text-[#24543d]">
            <span className="h-2 w-2 rounded-full bg-[#24543d]" />
            AI-powered website analysis
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.055em] text-[#202124] sm:text-7xl">
            Find what is holding your website back.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#787774] sm:text-xl">
            Enter your website and receive a clear, practical audit of the
            problems affecting user experience, visibility and conversions.
          </p>

          <div className="mt-12 rounded-xl border border-[#dededb] bg-white p-2 shadow-[0_2px_8px_rgba(15,15,15,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-14 flex-1 rounded-lg border border-transparent bg-[#f7f7f5] px-5 text-base text-[#2f3437] outline-none transition placeholder:text-[#9b9a97] focus:border-[#b9c9bf] focus:bg-white"
              />

              <button
                type="button"
                onClick={handleInspect}
                className="h-14 rounded-lg bg-[#18392b] px-7 font-semibold text-white transition hover:bg-[#24543d]"
              >
                Inspect website
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#9b9a97]">
            <span>No account required</span>
            <span className="hidden sm:inline">·</span>
            <span>Free preview</span>
            <span className="hidden sm:inline">·</span>
            <span>Full report for $9</span>
          </div>

          {showResult && (
            <div className="mt-10 rounded-xl border border-[#dfe6e1] bg-white p-6 shadow-[0_2px_8px_rgba(15,15,15,0.05)]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#787774]">
                    Website inspected
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#18392b]">
                    Score: 87/100
                  </h2>

                  <p className="mt-3 break-all text-sm text-[#787774]">
                    Preview audit for: {url || "your website"}
                  </p>
                </div>

                <div className="flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-[#dfe9e3] text-2xl font-bold text-[#18392b]">
                  87
                </div>
              </div>

              <div className="mt-8 border-t border-[#e9e9e7] pt-6">
                <p className="font-semibold text-[#2f3437]">
                  Your free preview is ready.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#787774]">
                  We found several opportunities to improve your website.
                  Unlock the full report to see all recommendations.
                </p>

                <a
                  href="https://buy.stripe.com/14A8wJfnv2wnerc9Hh6wE00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-12 items-center justify-center rounded-lg bg-[#18392b] px-6 font-semibold text-white transition hover:bg-[#24543d]"
                >
                  Unlock full report · $9
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="border-t border-[#e9e9e7] py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#24543d]">
              What we inspect
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#202124]">
              One audit. Six essential areas.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-[#e3e3e0] bg-[#e3e3e0] sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <div
                key={category}
                className="group bg-white p-6 transition hover:bg-[#f7f9f7]"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm text-[#9b9a97]">
                    0{index + 1}
                  </span>

                  <span className="text-[#a6b5ac] transition group-hover:translate-x-1 group-hover:text-[#24543d]">
                    →
                  </span>
                </div>

                <h3 className="mt-10 text-lg font-semibold text-[#2f3437]">
                  {category}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#787774]">
                  Clear findings and practical recommendations generated by AI.
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[#e9e9e7] py-8 text-sm text-[#9b9a97] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 PageInspector</span>
          <span>Understand your website. Improve what matters.</span>
        </footer>
      </div>
    </main>
  );
}