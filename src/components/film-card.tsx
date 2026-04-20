import Link from "next/link";

import { FilmFirm } from "@/types";

type FilmCardProps = {
  firm: FilmFirm;
  onSaveToCrm?: (firm: FilmFirm) => void;
  crmRecordId?: string | null;
};

export function FilmCard({ firm, onSaveToCrm, crmRecordId }: FilmCardProps) {
  const toneClass =
    firm.size === "large"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,239,231,0.96)_100%)] border-[rgba(108,54,26,0.12)] hover:shadow-[0_30px_80px_rgba(108,54,26,0.12)]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,242,248,0.96)_100%)] border-[rgba(69,48,84,0.12)] hover:shadow-[0_30px_80px_rgba(69,48,84,0.12)]";

  return (
    <article
      className={`surface-card group grain h-full rounded-[1.8rem] border p-5 transition duration-300 hover:-translate-y-1 md:p-6 ${toneClass}`}
    >
      <div
        className={`-mx-5 -mt-5 mb-5 h-1.5 rounded-t-[1.8rem] md:-mx-6 md:-mt-6 ${
          firm.size === "large"
            ? "bg-[linear-gradient(90deg,#a35224_0%,#f0aa63_100%)]"
            : "bg-[linear-gradient(90deg,#52426e_0%,#8e71c2_100%)]"
        }`}
      />

      <div className="flex flex-wrap gap-2">
        <span className={`tag ${firm.size === "large" ? "tag-dark" : "tag-strong"}`}>
          {firm.size === "large" ? "Large Studio" : "Independent"}
        </span>
        <span className="tag">{firm.region}</span>
        <span className="tag">{firm.focus}</span>
      </div>

      <div className="mt-6">
        <h3 className="display-title text-2xl font-semibold text-[var(--ink)]">{firm.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{firm.summary}</p>
      </div>

      <dl className="mt-6 grid gap-3 text-sm text-[var(--ink-soft)]">
        <div className="flex items-start justify-between gap-4 border-t border-[var(--line)] pt-3">
          <dt className="text-[0.72rem] uppercase tracking-[0.18em]">Location</dt>
          <dd className="max-w-[65%] text-right text-[var(--ink)]">
            {firm.city}, {firm.state}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-[var(--line)] pt-3">
          <dt className="text-[0.72rem] uppercase tracking-[0.18em]">Address</dt>
          <dd className="max-w-[65%] text-right text-[var(--ink)]">{firm.address ?? "Not listed"}</dd>
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
            className="rounded-full bg-[linear-gradient(135deg,#2f170a_0%,#7c3d1f_100%)] px-4 py-2.5 text-sm text-white shadow-[0_18px_45px_rgba(73,36,19,0.18)] transition hover:-translate-y-0.5"
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
          {firm.domain ?? "film firm"}
        </span>
      </div>
    </article>
  );
}
