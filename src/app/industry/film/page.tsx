import { AuthGate } from "@/components/auth-gate";
import { CurvedPattern } from "@/components/curved-pattern";
import { FilmDirectory } from "@/components/film-directory";
import { IndustrySectionNav } from "@/components/industry-section-nav";

export default function IndustryFilmPage() {
  return (
    <AuthGate
      description="Sign in before opening film company profiles, saving studios, and moving targets into the CRM pipeline."
      title="Login to view the film database."
    >
      <div className="pt-8">
        <section className="page-shell pb-12 pt-8 md:pt-14">
          <IndustrySectionNav />

          <div className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(91,47,19,0.08)] p-6 text-white shadow-[0_30px_90px_rgba(61,32,17,0.18)] md:p-10">
            <CurvedPattern variant="copper" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Industry Database / Film</p>
                <h1 className="display-title mt-4 text-4xl font-semibold text-white md:text-5xl">
                  A separate film page for studios, production companies, and regional operators.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.76)] md:text-lg">
                  Search film firms by studio size, region, and location, then move between grid and list
                  layouts for research across New York, California, and broader U.S. production markets.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.6)]">Page focus</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,255,255,0.78)]">
                    Studio scale, production regions, and public-source film company research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FilmDirectory />
      </div>
    </AuthGate>
  );
}
