"use client";

import { useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/modal";
import {
  buildCrmResearchSnapshot,
  buildMailtoHref,
  getPrimaryOutreachEmail,
  updateCrmRecord
} from "@/lib/utils";
import { CrmOutreachStatus, CrmRecord, CrmRecordInput } from "@/types";

type CrmRecordModalProps = {
  open: boolean;
  record: CrmRecord | null;
  onClose: () => void;
  onDelete: (recordId: string) => void;
  onSave: (record: CrmRecord) => void;
};

const statusOptions: Array<{ value: CrmOutreachStatus; label: string }> = [
  { value: "saved", label: "Saved" },
  { value: "sent", label: "Sent" },
  { value: "follow-up-1", label: "Follow up email 1" },
  { value: "follow-up-2", label: "Follow up email 2" },
  { value: "follow-up-3", label: "Follow up email 3" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" }
];

const emptyFormState: CrmRecordInput = {
  companyEmail: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactLinkedIn: "",
  status: "saved",
  notes: "",
  nextStep: "",
  lastContacted: "",
  emailSubject: "",
  outreachDraft: ""
};

export function CrmRecordModal({
  open,
  record,
  onClose,
  onDelete,
  onSave
}: CrmRecordModalProps) {
  const [formState, setFormState] = useState<CrmRecordInput>(emptyFormState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !record) {
      return;
    }

    setFormState({
      companyEmail: record.companyEmail,
      contactName: record.contactName,
      contactRole: record.contactRole,
      contactEmail: record.contactEmail,
      contactLinkedIn: record.contactLinkedIn,
      status: record.status,
      notes: record.notes,
      nextStep: record.nextStep,
      lastContacted: record.lastContacted,
      emailSubject: record.emailSubject,
      outreachDraft: record.outreachDraft
    });
    setError("");
  }, [open, record]);

  const research = useMemo(() => (record ? buildCrmResearchSnapshot(record) : null), [record]);
  const draftRecord = useMemo(
    () =>
      record
        ? ({
            ...record,
            ...formState
          } satisfies CrmRecord)
        : null,
    [formState, record]
  );
  const liveMailtoHref = draftRecord ? buildMailtoHref(draftRecord) : "";
  const preferredOutreachEmail = draftRecord ? getPrimaryOutreachEmail(draftRecord) : "";

  function update<Key extends keyof CrmRecordInput>(key: Key, value: CrmRecordInput[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function applyCompanyEmailSuggestion(email: string) {
    setFormState((current) => ({
      ...current,
      companyEmail: email,
      contactEmail: current.contactEmail || email
    }));
  }

  function applyRoleSuggestion(role: string, suggestedEmail: string) {
    setFormState((current) => ({
      ...current,
      contactRole: role,
      contactEmail: current.contactEmail || suggestedEmail || current.companyEmail || ""
    }));
  }

  function handleSave() {
    if (!record) {
      return;
    }

    if (formState.companyEmail.trim() && !/\S+@\S+\.\S+/.test(formState.companyEmail.trim())) {
      setError("Please use a valid company email or leave it blank.");
      return;
    }

    if (formState.contactEmail.trim() && !/\S+@\S+\.\S+/.test(formState.contactEmail.trim())) {
      setError("Please use a valid contact email or leave it blank.");
      return;
    }

    onSave(
      updateCrmRecord(record, {
        companyEmail: formState.companyEmail.trim(),
        contactName: formState.contactName.trim(),
        contactRole: formState.contactRole.trim(),
        contactEmail: formState.contactEmail.trim(),
        contactLinkedIn: formState.contactLinkedIn.trim(),
        status: formState.status,
        notes: formState.notes.trim(),
        nextStep: formState.nextStep.trim(),
        lastContacted: formState.lastContacted,
        emailSubject: formState.emailSubject.trim() || `Intro to ${record.organization}`,
        outreachDraft: formState.outreachDraft
      })
    );
    onClose();
  }

  function handleDelete() {
    if (!record) {
      return;
    }

    if (!window.confirm(`Remove ${record.organization} from CRM?`)) {
      return;
    }

    onDelete(record.id);
    onClose();
  }

  return (
    <Modal
      description="Use the assistant side to move faster on likely inboxes and high-leverage roles, then lock in the real contact details on the right."
      onClose={onClose}
      open={open && Boolean(record)}
      title={record ? `Research ${record.organization}` : "Research"}
    >
      {record && research ? (
        <>
          <div className="mb-5 grid gap-3 rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-[rgba(246,249,252,0.88)] p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                {record.sourceType === "finance" ? "Finance source" : "Film source"}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{record.organization}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {record.segment} · {record.location}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                className="cta-light rounded-full px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-white"
                href={record.website}
                rel="noreferrer"
                target="_blank"
              >
                Visit website
              </a>
              <a
                className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[rgba(245,248,252,0.92)]"
                href={research.companyLinkedInSearchUrl}
                rel="noreferrer"
                target="_blank"
              >
                Search company on LinkedIn
              </a>
              {draftRecord?.contactLinkedIn.trim() ? (
                <a
                  className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[rgba(245,248,252,0.92)]"
                  href={draftRecord.contactLinkedIn}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open saved LinkedIn
                </a>
              ) : null}
              {preferredOutreachEmail ? (
                <a className="cta-dark rounded-full px-4 py-2 text-sm transition" href={liveMailtoHref}>
                  {draftRecord?.contactEmail.trim() ? "Email contact" : "Email company"}
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.7rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(180deg,#f9fcff_0%,#eef6fb_100%)] p-5 shadow-[0_18px_55px_rgba(10,20,32,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Research assistant</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    Fast outreach leads generated from the saved domain and organization type.
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(60,169,179,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#17616a]">
                  Local research
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {research.messages.map((message) => (
                  <div
                    className="max-w-[92%] rounded-[1.3rem] rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)] shadow-[0_14px_36px_rgba(10,20,32,0.05)]"
                    key={message.id}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-[rgba(11,24,35,0.08)] bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">Likely company emails</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    {research.domainLabel}
                  </span>
                </div>

                <div className="mt-3 grid gap-2">
                  {research.companyEmailCandidates.length > 0 ? (
                    research.companyEmailCandidates.map((email) => (
                      <button
                        className="flex items-center justify-between rounded-[1rem] border border-[rgba(11,24,35,0.08)] bg-[rgba(246,249,252,0.92)] px-3 py-3 text-left text-sm text-[var(--ink)] transition hover:bg-white"
                        key={email}
                        onClick={() => applyCompanyEmailSuggestion(email)}
                        type="button"
                      >
                        <span>{email}</span>
                        <span className="text-xs uppercase tracking-[0.16em] text-[#17616a]">Use</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--ink-soft)]">
                      No clean website domain was found yet, so company inbox suggestions are waiting on that.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {research.contactCandidates.map((candidate) => (
                  <div
                    className="rounded-[1.4rem] border border-[rgba(11,24,35,0.08)] bg-white/80 p-4 shadow-[0_12px_32px_rgba(10,20,32,0.04)]"
                    key={candidate.role}
                  >
                    <p className="text-sm font-semibold text-[var(--ink)]">{candidate.role}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{candidate.reason}</p>
                    {candidate.suggestedEmail ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Suggested inbox: {candidate.suggestedEmail}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-[rgba(60,169,179,0.18)] bg-[rgba(60,169,179,0.08)] px-3 py-2 text-sm font-medium text-[#17616a] transition hover:bg-[rgba(60,169,179,0.12)]"
                        onClick={() => applyRoleSuggestion(candidate.role, candidate.suggestedEmail)}
                        type="button"
                      >
                        Use role
                      </button>
                      <a
                        className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[rgba(245,248,252,0.92)]"
                        href={candidate.linkedinSearchUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        LinkedIn search
                      </a>
                      <a
                        className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[rgba(245,248,252,0.92)]"
                        href={candidate.webSearchUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Web search
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] p-5 shadow-[0_18px_55px_rgba(10,20,32,0.06)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Outreach details</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Save the verified details you want to keep after reviewing the assistant suggestions.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm text-[var(--ink-soft)]">Company email</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("companyEmail", event.target.value)}
                    placeholder="info@company.com"
                    type="email"
                    value={formState.companyEmail}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Primary contact name</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("contactName", event.target.value)}
                    placeholder="Person to reach out to"
                    value={formState.contactName}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Primary contact role</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("contactRole", event.target.value)}
                    placeholder="CEO, founder, managing director"
                    value={formState.contactRole}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Primary contact email</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("contactEmail", event.target.value)}
                    placeholder="name@organization.com"
                    type="email"
                    value={formState.contactEmail}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Primary contact LinkedIn</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("contactLinkedIn", event.target.value)}
                    placeholder="https://www.linkedin.com/in/..."
                    value={formState.contactLinkedIn}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Outreach status</span>
                  <select
                    className="form-field"
                    onChange={(event) =>
                      update("status", event.target.value as CrmRecordInput["status"])
                    }
                    value={formState.status}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[var(--ink-soft)]">Last contacted</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("lastContacted", event.target.value)}
                    type="date"
                    value={formState.lastContacted}
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm text-[var(--ink-soft)]">Next step</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("nextStep", event.target.value)}
                    placeholder="Verify contact, send intro, ask for warm intro, follow up next week"
                    value={formState.nextStep}
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm text-[var(--ink-soft)]">Email subject</span>
                  <input
                    className="form-field"
                    onChange={(event) => update("emailSubject", event.target.value)}
                    placeholder={`Intro to ${record.organization}`}
                    value={formState.emailSubject}
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm text-[var(--ink-soft)]">Outreach draft</span>
                  <textarea
                    className="form-field min-h-36"
                    onChange={(event) => update("outreachDraft", event.target.value)}
                    placeholder="Draft the message you want ready when it is time to reach out."
                    value={formState.outreachDraft}
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm text-[var(--ink-soft)]">Notes</span>
                  <textarea
                    className="form-field min-h-28"
                    onChange={(event) => update("notes", event.target.value)}
                    placeholder="Keep the verified contact, why the fit matters, and how you want to approach them."
                    value={formState.notes}
                  />
                </label>
              </div>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-[#8d3f27]">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded-full border border-[rgba(141,63,39,0.18)] bg-[rgba(141,63,39,0.08)] px-5 py-3 text-sm font-medium text-[#8d3f27] transition hover:bg-[rgba(141,63,39,0.12)]"
              onClick={handleDelete}
              type="button"
            >
              Remove from CRM
            </button>

            <div className="flex flex-wrap gap-3">
              {preferredOutreachEmail ? (
                <a
                  className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[rgba(245,248,252,0.92)]"
                  href={liveMailtoHref}
                >
                  Open email draft
                </a>
              ) : null}
              <button className="cta-dark rounded-full px-5 py-3 text-sm transition" onClick={handleSave}>
                Save outreach details
              </button>
            </div>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
