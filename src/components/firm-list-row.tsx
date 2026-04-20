import Link from "next/link";

import { FinanceFirm } from "@/types";

type FirmListRowProps = {
  firm: FinanceFirm;
  onSaveToCrm?: (firm: FinanceFirm) => void;
  crmRecordId?: string | null;
};

export function FirmListRow({ firm, onSaveToCrm, crmRecordId }: FirmListRowProps) {
  const toneClass =
    firm.boutiqueStatus === "boutique"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(235,249,246,0.92)_100%)] border-[rgba(33,114,120,0.12)] hover:shadow-[0_24px_65px_rgba(16,95,102,0.1)]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(236,242,250,0.94)_100%)] border-[rgba(54,92,139,0.12)] hover:shadow-[0_24px_65px_rgba(54,92,139,0.1)]";

  return (
    <article className={`surface-card rounded-[1.6rem] border p-5 transition duration-300 hover:-translate-y-0.5 ${toneClass}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="display-title text-2xl font-semibold text-[var(--ink)]">{firm.name}</h3>
            <span
              className={`tag ${firm.boutiqueStatus === "boutique" ? "tag-strong" : "tag-dark"}`}
            >
              {firm.boutiqueStatus === "boutique" ? "Boutique" : "Institutional"}
            </span>
            <span className="tag">{firm.category}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{firm.summary}</p>
        </div>

        <div className="grid gap-2 text-sm text-[var(--ink-soft)] lg:min-w-[18rem] lg:text-right">
          <p>
            <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Location</span>
            <span className="text-[var(--ink)]">{firm.location}</span>
          </p>
          <p>
            <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Focus</span>
            <span className="text-[var(--ink)]">{firm.focusArea ?? "General finance profile"}</span>
          </p>
          {firm.marketSymbol ? (
            <p>
              <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Ticker</span>
              <span className="text-[var(--ink)]">{firm.marketSymbol}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        <Link
          className="cta-dark inline-flex rounded-full px-4 py-2.5 text-sm transition"
          href={firm.website}
          rel="noreferrer"
          target="_blank"
        >
          Open website
        </Link>
        {crmRecordId ? (
          <Link
            className="cta-light rounded-full px-4 py-2.5 text-sm transition hover:bg-white"
            href="/crm"
          >
            Open CRM
          </Link>
        ) : onSaveToCrm ? (
          <button
            className="cta-light rounded-full px-4 py-2.5 text-sm transition hover:bg-white"
            onClick={() => onSaveToCrm(firm)}
            type="button"
          >
            Save to CRM
          </button>
        ) : null}
        {firm.notes ? (
          <p className="text-xs leading-5 text-[var(--ink-soft)]">{firm.notes}</p>
        ) : (
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Ready for recruiting research
          </p>
        )}
      </div>
    </article>
  );
}
