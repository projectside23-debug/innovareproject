import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-shell pb-12 pt-6">
      <div className="rounded-[2rem] border border-[rgba(8,20,30,0.08)] bg-[linear-gradient(180deg,#0c1721,#132636)] px-6 py-8 text-white shadow-[0_32px_90px_rgba(8,20,30,0.18)] md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Innovare</p>
            <h3 className="display-title mt-3 text-3xl font-semibold text-white">
              An innovation ecosystem for discovering organizations and growing entrepreneurship in universities.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.7)]">
              Use it to track research interests, find collaborators, and open more selective paths for
              students and early builders to work on real ventures.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[rgba(255,255,255,0.78)]">
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.14)]"
              href="/industry"
            >
              Industry Database
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.14)]"
              href="/universities"
            >
              University Opportunities
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.14)]"
              href="/crm"
            >
              CRM
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.14)]"
              href="/#contact"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
