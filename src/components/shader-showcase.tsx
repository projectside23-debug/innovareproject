"use client";

import Link from "next/link";

import { WebGLShader } from "@/components/ui/web-gl-shader";

export function ShaderShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#071426] py-16 text-white shadow-[0_34px_100px_rgba(7,20,38,0.18)] md:py-20">
      <WebGLShader />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(217,141,76,0.16),transparent_24%),linear-gradient(180deg,rgba(7,20,38,0.18),rgba(7,20,38,0.94))]" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 text-center md:px-8">
        <p className="eyebrow text-xs text-[rgba(255,255,255,0.58)]">Live layer</p>
        <h2 className="display-title mx-auto mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] text-white md:text-7xl">
          Discovery should feel
          <span className="block bg-[linear-gradient(90deg,#d98d4c_0%,#dfc16c_38%,#9dd8eb_100%)] bg-clip-text text-transparent">
            alive, useful, and in motion.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.68)] md:text-base">
          A moving research layer for firms, projects, outreach, and university startups, built to turn curiosity into action.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            className="rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(4,12,18,0.76)] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(140,201,219,0.22)] transition hover:-translate-y-0.5 hover:bg-[rgba(9,28,42,0.9)]"
            href="/industry"
          >
            Open database
          </Link>
          <Link
            className="rounded-full bg-[#2d7ff0] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(45,127,240,0.26)] transition hover:-translate-y-0.5 hover:bg-[#246fd4]"
            href="/crm"
          >
            Open CRM
          </Link>
        </div>
      </div>
    </section>
  );
}
