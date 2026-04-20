import { AuthGate } from "@/components/auth-gate";
import { CurvedPattern } from "@/components/curved-pattern";
import { FinanceDirectory } from "@/components/finance-directory";
import { IndustrySectionNav } from "@/components/industry-section-nav";

export default function IndustryFinancePage() {
  return (
    <AuthGate
      description="Sign in before opening finance firm profiles, saving companies, and moving targets into the CRM pipeline."
      title="Login to view the finance database."
    >
      <div className="pt-8">
        <section className="page-shell pb-12 pt-8 md:pt-14">
          <IndustrySectionNav />

          <div className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(12,33,48,0.08)] p-6 text-white shadow-[0_30px_90px_rgba(8,20,30,0.18)] md:p-10">
            <CurvedPattern />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Industry Database / Finance</p>
                <h1 className="display-title mt-4 text-4xl font-semibold text-white md:text-5xl">
                  A cleaner finance page for serious recruiting research.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.76)] md:text-lg">
                  Search finance firms by category, boutique status, and location, then move between grid
                  and list views depending on whether you are scanning the market or saving targets.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.6)]">Page focus</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,255,255,0.78)]">
                    Boutique breakdowns, market structure, and location concentration for finance recruiting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FinanceDirectory />
      </div>
    </AuthGate>
  );
}
