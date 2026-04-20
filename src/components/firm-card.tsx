import Link from "next/link";

import { FinanceFirm } from "@/types";

type FirmCardProps = {
  firm: FinanceFirm;
  onSaveToCrm?: (firm: FinanceFirm) => void;
  crmRecordId?: string | null;
};

export function FirmCard({ firm, onSaveToCrm, crmRecordId }: FirmCardProps) {
  const toneClass =
    firm.boutiqueStatus === "boutique"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(234,248,245,0.92)_100%)] border-[rgba(33,114,120,0.12)] hover:shadow-[0_30px_80px_rgba(16,95,102,0.12)]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(236,242,250,0.94)_100%)] border-[rgba(54,92,139,0.12)] hover:shadow-[0_30px_80px_rgba(54,92,139,0.12)]";

  return (
    <article
      className={`surface-card group grain h-full rounded-[1.8rem] border p-5 transition duration-300 hover:-translate-y-1 md:p-6 ${toneClass}`}
    >
      <div
        className={`-mx-5 -mt-5 mb-5 h-1.5 rounded-t-[1.8rem] md:-mx-6 md:-mt-6 ${
          firm.boutiqueStatus === "boutique"
            ? "bg-[linear-gradient(90deg,#1bb6ac_0%,#8ce9de_100%)]"
            : "bg-[linear-gradient(90deg,#4c8fff_0%,#92b7ff_100%)]"
        }`}
      />
      <div className="flex flex-wrap gap-2">
        <span className={`tag ${firm.boutiqueStatus === "boutique" ? "tag-strong" : "tag-dark"}`}>
          {firm.boutiqueStatus === "boutique" ? "Boutique" : "Institutional"}
        </span>
        <span className="tag">{firm.category}</span>
        {firm.marketSymbol ? <span className="tag">{firm.marketSymbol}</span> : null}
      </div>

      <div className="mt-6">
        <h3 className="display-title text-2xl font-semibold text-[var(--ink)]">{firm.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{firm.summary}</p>
      </div>

      <dl className="mt-6 grid gap-3 text-sm text-[var(--ink-soft)]">
        <div className="flex items-start justify-between gap-4 border-t border-[var(--line)] pt-3">
          <dt className="text-[0.72rem] uppercase tracking-[0.18em]">Location</dt>
          <dd className="max-w-[65%] text-right text-[var(--ink)]">{firm.location}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-[var(--line)] pt-3">
          <dt className="text-[0.72rem] uppercase tracking-[0.18em]">Focus</dt>
          <dd className="max-w-[65%] text-right text-[var(--ink)]">
            {firm.focusArea ?? "General finance profile"}
          </dd>
        </div>
      </dl>

      {firm.notes ? (
        <p className="mt-5 rounded-2xl bg-[rgba(255,255,255,0.72)] px-4 py-3 text-xs leading-5 text-[var(--ink-soft)]">
          {firm.notes}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            className="cta-dark inline-flex rounded-full px-4 py-2.5 text-sm transition"
            href={firm.website}
            rel="noreferrer"
            target="_blank"
          >
            Visit website
          </Link>
          {crmRecordId ? (
            <Link
              className="cta-light inline-flex rounded-full px-4 py-2.5 text-sm text-[var(--ink)] transition hover:bg-white"
              href="/crm"
            >
              Open CRM
            </Link>
          ) : onSaveToCrm ? (
            <button
              className="cta-light inline-flex rounded-full px-4 py-2.5 text-sm text-[var(--ink)] transition hover:bg-white"
              onClick={() => onSaveToCrm(firm)}
              type="button"
            >
              Save to CRM
            </button>
          ) : null}
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
          {firm.domain ?? "research-ready"}
        </span>
      </div>
    </article>
  );
}
