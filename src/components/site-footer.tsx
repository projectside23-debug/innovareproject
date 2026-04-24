import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-shell pb-6 pt-4 md:pb-12 md:pt-6">
      <div className="rounded-[1.5rem] border border-[rgba(8,20,30,0.08)] bg-[linear-gradient(180deg,#0c1721,#132636)] px-4 py-5 text-white shadow-[0_32px_90px_rgba(8,20,30,0.18)] md:rounded-[2rem] md:px-8 md:py-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Innovare</p>
            <h3 className="display-title mt-2 text-2xl font-semibold text-white md:mt-3 md:text-3xl">
              An innovation ecosystem for discovering organizations and growing entrepreneurship in universities.
            </h3>
            <p className="mt-2 text-sm leading-5 text-[rgba(255,255,255,0.7)] md:mt-3 md:leading-6">
              Use it to track research interests, find collaborators, and open more selective paths for
              students and early builders to work on real ventures.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-[rgba(255,255,255,0.78)] md:gap-3">
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.14)] md:px-4 md:py-2 md:text-sm"
              href="/industry"
            >
              Industry Database
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.14)] md:px-4 md:py-2 md:text-sm"
              href="/universities"
            >
              University Opportunities
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.14)] md:px-4 md:py-2 md:text-sm"
              href="/crm"
            >
              CRM
            </Link>
            <Link
              className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs transition hover:bg-[rgba(255,255,255,0.14)] md:px-4 md:py-2 md:text-sm"
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
