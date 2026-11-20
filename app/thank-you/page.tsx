"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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

      <section className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <span className="font-mono-utility inline-flex items-center gap-2 rounded-full border border-[#EDEAE9] bg-[#E3F3EB] px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.06em]">
            &#9989; Payment received
          </span>

          <h1 className="font-display mx-auto mt-6 max-w-[620px] text-[34px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[48px]">
            You&apos;re in &mdash; the inspector is
            <br />
            <span className="inline-block rounded-lg bg-[#FFE9E7] px-2.5 py-0.5">
              already on the case
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[480px] text-[17px] leading-[1.6] text-[#6D6E6F]">
            {email ? (
              <>Your full report is being compiled and will land in <span className="font-semibold text-[#1E1F21]">{email}</span> within a few minutes.</>
            ) : (
              <>Your full report is being compiled and will land in your inbox within a few minutes.</>
            )}
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-[560px]">
          <div className="relative overflow-hidden rounded-2xl border border-[#EDEAE9] bg-white shadow-[0_4px_8px_rgba(24,21,26,0.06),0_20px_40px_rgba(24,21,26,0.10)]">
            <div className="flex items-center gap-2 border-b-[1.5px] border-black/10 bg-[#F9F8F8] px-3.5 py-3">
              <div className="flex gap-1.5">
                <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
                <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
                <i className="block h-2.5 w-2.5 rounded-full bg-black/15" />
              </div>
              <div className="font-mono-utility flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#6D6E6F]">
                yourwebsite.com
              </div>
            </div>

            <div className="browser-body-bg relative h-[220px] overflow-hidden p-5">
              <div className="animate-scan absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#F06A6A] to-transparent shadow-[0_0_16px_2px_rgba(240,106,106,0.5)]" />
              <div className="mb-3.5 h-[22px] w-[55%] rounded-lg bg-[#F1EFEE]" />
              <div className="mb-3.5 h-3 w-[90%] rounded-lg bg-[#F1EFEE]" />
              <div className="mb-3.5 h-3 w-[78%] rounded-lg bg-[#F1EFEE]" />
              <div className="h-[60px] w-full rounded-lg bg-gradient-to-br from-[#FDF1DC] to-[#FFE9E7]" />
            </div>
          </div>

          <div className="animate-bob font-mono-utility absolute -top-4 left-5 rounded-lg bg-[#1E1F21] px-2.5 py-1.5 text-[11px] font-semibold text-[#FFFFFF]">
            scanning six areas...
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[420px] rounded-2xl border border-[#EDEAE9] bg-white p-6 shadow-[0_1px_2px_rgba(24,21,26,0.04),0_8px_24px_rgba(24,21,26,0.06)]">
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3 text-[14.5px] font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F3EB] text-[13px] text-[#3E8F6C]">&#10003;</span>
              Payment confirmed
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#F06A6A] text-[13px]">
                <span className="animate-pulse-slow block h-2 w-2 rounded-full bg-[#F06A6A]" />
              </span>
              Running full audit across all 6 areas
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium text-[#6D6E6F]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black/15 text-[13px]" />
              Compiling your report
            </li>
            <li className="flex items-center gap-3 text-[14.5px] font-medium text-[#6D6E6F]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black/15 text-[13px]" />
              Sending it to your inbox
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-[13.5px] text-[#6D6E6F]">
          Didn&apos;t get it after 15 minutes? Check your spam folder, or{" "}
          <a href="mailto:support@page-inspector.com" className="font-semibold text-[#1E1F21] underline underline-offset-2">
            contact us
          </a>
          .
        </p>

        <div className="mt-10 flex justify-center">
          
            <a
            href="/"
            className="rounded-xl border border-[#EDEAE9] bg-white px-6 py-3 text-[14px] font-bold transition-transform hover:"
          >
            &larr; Back to homepage
          </a>
        </div>
      </section>

      <footer className="bg-[#FFE9E7]">
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