import Link from "next/link";

import { FilmFirm } from "@/types";

type FilmListRowProps = {
  firm: FilmFirm;
  onSaveToCrm?: (firm: FilmFirm) => void;
  crmRecordId?: string | null;
};

export function FilmListRow({ firm, onSaveToCrm, crmRecordId }: FilmListRowProps) {
  const toneClass =
    firm.size === "large"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,239,231,0.96)_100%)] border-[rgba(108,54,26,0.12)] hover:shadow-[0_24px_65px_rgba(108,54,26,0.1)]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,242,248,0.96)_100%)] border-[rgba(69,48,84,0.12)] hover:shadow-[0_24px_65px_rgba(69,48,84,0.1)]";

  return (
    <article className={`surface-card rounded-[1.6rem] border p-5 transition duration-300 hover:-translate-y-0.5 ${toneClass}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="display-title text-2xl font-semibold text-[var(--ink)]">{firm.name}</h3>
            <span className={`tag ${firm.size === "large" ? "tag-dark" : "tag-strong"}`}>
              {firm.size === "large" ? "Large Studio" : "Independent"}
            </span>
            <span className="tag">{firm.region}</span>
            <span className="tag">{firm.focus}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{firm.summary}</p>
        </div>

        <div className="grid gap-2 text-sm text-[var(--ink-soft)] lg:min-w-[18rem] lg:text-right">
          <p>
            <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Location</span>
            <span className="text-[var(--ink)]">
              {firm.city}, {firm.state}
            </span>
          </p>
          <p>
            <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Focus</span>
            <span className="text-[var(--ink)]">{firm.focus}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        <Link
          className="rounded-full bg-[linear-gradient(135deg,#2f170a_0%,#7c3d1f_100%)] px-4 py-2.5 text-sm text-white shadow-[0_18px_45px_rgba(73,36,19,0.18)] transition hover:-translate-y-0.5"
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
        {firm.sourceUrl ? (
          <Link
            className="cta-light rounded-full px-4 py-2.5 text-sm transition hover:bg-white"
            href={firm.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Source
          </Link>
        ) : null}
        <p className="text-xs leading-5 text-[var(--ink-soft)]">
          {firm.notes ?? "Production company profile ready for research."}
        </p>
      </div>
    </article>
  );
}
