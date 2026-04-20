import Image from "next/image";
import Link from "next/link";

import filmFirms from "@/data/film-firms.json";
import financeFirms from "@/data/finance-firms.json";

import { AuthGate } from "@/components/auth-gate";
import { CurvedPattern } from "@/components/curved-pattern";
import { IndustrySectionNav } from "@/components/industry-section-nav";
import { GlowCard } from "@/components/ui/spotlight-card";

const financeCount = (financeFirms as { id: string }[]).length;
const filmCount = (filmFirms as { id: string }[]).length;

export default function IndustryPage() {
  return (
    <AuthGate
      description="Sign in before opening the industry database, saving firms, and moving companies into your CRM workflow."
      title="Login to view the industry database."
    >
      <div className="pt-8">
        <section className="page-shell pb-20 pt-8 md:pt-14">
          <IndustrySectionNav />

          <div className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(12,33,48,0.08)] p-6 text-white shadow-[0_30px_90px_rgba(8,20,30,0.18)] md:p-10">
            <CurvedPattern />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Industry Database</p>
                <h1 className="display-title mt-4 text-4xl font-semibold text-white md:text-5xl">
                  Two research pages inside one private database.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.76)] md:text-lg">
                  Move between finance and film depending on what you are researching. Each page keeps
                  its own stats, filters, and view modes while staying inside the same Innovare system.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="relative min-h-[12rem] overflow-hidden border border-[rgba(255,255,255,0.12)]">
                  <Image
                    alt="Mountain landscape at sunrise"
                    className="object-cover"
                    fill
                    src="/images/discovery-mountain.jpg"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.08),rgba(7,20,38,0.7))]" />
                  <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold leading-6 text-white">
                    Discover firms, save targets, and move them through CRM stages.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">Finance firms</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{financeCount}</p>
                  </div>
                  <div className="border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">Film firms</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{filmCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <GlowCard
              className="min-h-[23rem] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(238,246,251,0.88)_100%)] p-6 shadow-[0_24px_80px_rgba(10,20,32,0.08)] md:p-8"
              customSize
              glowColor="blue"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="eyebrow text-xs text-[var(--ink-soft)]">Finance Page</p>
                  <h2 className="display-title mt-4 text-4xl font-semibold text-[var(--ink)]">
                    Recruiting-focused finance research.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                    Browse boutique firms, elite boutiques, bulge bracket platforms, and location-heavy
                    recruiting targets with filters, list or grid mode, and visual market breakdowns.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-[var(--ink-soft)]">{financeCount} entries currently available</p>
                  <Link className="cta-dark rounded-full px-5 py-3 text-sm transition" href="/industry/finance">
                    Open finance page
                  </Link>
                </div>
              </div>
            </GlowCard>

            <GlowCard
              className="min-h-[23rem] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(251,241,232,0.9)_100%)] p-6 shadow-[0_24px_80px_rgba(91,47,19,0.08)] md:p-8"
              customSize
              glowColor="orange"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="eyebrow text-xs text-[var(--ink-soft)]">Film Page</p>
                  <h2 className="display-title mt-4 text-4xl font-semibold text-[var(--ink)]">
                    Production companies, studios, and regional film operators.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                    Search the film dataset by studio size, region, and focus area, with a separate visual
                    language tailored to production companies and studio ecosystems.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-[var(--ink-soft)]">{filmCount} entries with valid websites</p>
                  <Link
                    className="rounded-full bg-[linear-gradient(135deg,#2f170a_0%,#7c3d1f_100%)] px-5 py-3 text-sm text-white shadow-[0_18px_45px_rgba(73,36,19,0.18)] transition hover:-translate-y-0.5"
                    href="/industry/film"
                  >
                    Open film page
                  </Link>
                </div>
              </div>
            </GlowCard>
          </div>
        </section>
      </div>
    </AuthGate>
  );
}
