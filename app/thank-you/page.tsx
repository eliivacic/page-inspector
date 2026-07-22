"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#18151A]">
      <nav className="border-b border-black/10 bg-[#F8F6F1]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center px-6 py-4 sm:px-8">
          <a href="/" className="font-display flex items-center gap-2.5 text-[19px] font-semibold">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" fill="#E7DBFA" stroke="#18151A" strokeWidth="1.5" />
              <circle cx="17" cy="17" r="6" fill="none" stroke="#18151A" strokeWidth="2" />
              <line x1="21.5" y1="21.5" x2="27" y2="27" stroke="#18151A" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            PAGE <span className="text-[#8B6FD9]">INSPECTOR</span>
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <span className="font-mono-utility inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#18151A] bg-[#B9EBD3] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
            &#9989; Payment received
          </span>

          <h1 className="font-display mx-auto mt-6 max-w-[620px] text-[34px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[48px]">
            You&apos;re in &mdash; the inspector is
            <br />
            <span className="inline-block -rotate-2 rounded-lg bg-[#FFD84D] px-2.5 py-0.5 shadow-[2px_2px_0_#18151A]">
              already on the case
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[480px] text-[17px] leading-[1.6] text-[#5B5560]">
            {email ? (
              <>Your full report is being compiled and will land in <span className="font-semibold text-[#18151A]">{email}</span> within a few minutes.</>
            ) : (
              <>Your full report is being compiled and will land in your inbox within a few minutes.</>
            )}
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-[560px]">
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

            <div className="browser-body-bg relative h-[220px] overflow-hidden p-5">
              <div className="animate-scan absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#8B6FD9] to-transparent shadow-[0_0_16px_2px_rgba(139,111,217,0.6)]" />
              <div className="mb-3.5 h-[22px] w-[55%] rounded-lg bg-[#EFEAF7]" />
              <div className="mb-3.5 h-3 w-[90%] rounded-lg bg-[#EFEAF7]" />
              <div className="mb-3.5 h-3 w-[78%] rounded-lg bg-[#EFEAF7]" />
              <div className="h-[60px] w-full rounded-lg bg-gradient-to-br from-[#FFE6CE] to-[#E7DBFA]" />
            </div>
          </div>

          <div className="animate-bob font-mono-utility absolute -top-4 left-5 rounded-lg bg-[#18151A] px-2.5 py-1.5 text-[11px] font-semibold text-[#F8F6F1]">
            scanning six areas...
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[420px] rounded-2xl border-[1.5px] border-[#18151A] bg-white p-6 shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]">
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3 text-[14.5px] font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B9EBD3] text-[13px] text-[#1E6B48]">&#10003;</span>
              Payment confirmed
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#8B6FD9] text-[13px]">
                <span className="animate-pulse-slow block h-2 w-2 rounded-full bg-[#8B6FD9]" />
              </span>
              Running full audit across all 6 areas
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium text-[#5B5560]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black/15 text-[13px]" />
              Compiling your report
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium text-[#5B5560]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black/15 text-[13px]" />
              Sending it to your inbox
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-[13.5px] text-[#5B5560]">
          Didn&apos;t get it after 15 minutes? Check your spam folder, or{" "}
          <a href="mailto:support@pageinspector.com" className="font-semibold text-[#18151A] underline underline-offset-2">
            contact us
          </a>
          .
        </p>

        <div className="mt-10 flex justify-center">
          
            <a
            href="/"
            className="rounded-xl border-[1.5px] border-[#18151A] bg-white px-6 py-3 text-[14px] font-bold shadow-[3px_3px_0_#18151A] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#18151A]"
          >
            &larr; Back to homepage
          </a>
        </div>
      </section>

      <footer className="bg-[#E7DBFA]">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-3.5 px-6 py-10 text-[13.5px] font-medium sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>&copy; 2026 Page Inspector</span>
          <div className="flex gap-[22px] font-semibold">
            <a href="/privacy" className="transition-opacity hover:opacity-60">Privacy policy</a>
            <a href="/terms" className="transition-opacity hover:opacity-60">Terms of use</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}