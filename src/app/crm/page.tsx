import { CrmBoard } from "@/components/crm-board";

export default function CrmPage() {
  return (
    <div className="pt-8">
      <section className="page-shell pb-6 pt-8 md:pt-12">
        <div className="max-w-2xl">
          <p className="eyebrow text-xs text-[var(--ink-soft)]">CRM</p>
          <h1 className="display-title mt-3 text-4xl font-semibold text-[var(--ink)] md:text-5xl">
            Research contacts and reach out with more intention.
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            A tighter outreach layer for saved firms, with likely inboxes, likely roles, LinkedIn search
            paths, and notes that stay attached to the record.
          </p>
        </div>
      </section>

      <CrmBoard />
    </div>
  );
}
