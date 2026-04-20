"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/modal";
import { normalizeWebsite } from "@/lib/utils";
import { FinanceFirmInput } from "@/types";

type AddFirmModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: FinanceFirmInput) => void;
};

const initialState: FinanceFirmInput = {
  name: "",
  website: "",
  boutiqueStatus: "boutique",
  category: "Industry",
  focusArea: "",
  location: "",
  summary: "",
  notes: ""
};

export function AddFirmModal({ open, onClose, onSubmit }: AddFirmModalProps) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormState(initialState);
      setError("");
    }
  }, [open]);

  function updateField<Key extends keyof FinanceFirmInput>(key: Key, value: FinanceFirmInput[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    const normalizedWebsite = normalizeWebsite(formState.website);
    if (!formState.name.trim()) {
      setError("Organization name is required.");
      return;
    }
    if (!normalizedWebsite) {
      setError("A valid website is required.");
      return;
    }

    onSubmit({ ...formState, website: normalizedWebsite });
    onClose();
  }

  return (
    <Modal
      description="Store a new organization locally so the database can grow across industries without waiting on backend tooling."
      onClose={onClose}
      open={open}
      title="Add an organization"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Organization name</span>
          <input
            className="form-field"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Studio, firm, think tank, lab, collective"
            value={formState.name}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Website</span>
          <input
            className="form-field"
            onChange={(event) => updateField("website", event.target.value)}
            placeholder="https://example.com"
            value={formState.website}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Boutique status</span>
          <select
            className="form-field"
            onChange={(event) =>
              updateField("boutiqueStatus", event.target.value as FinanceFirmInput["boutiqueStatus"])
            }
            value={formState.boutiqueStatus}
          >
            <option value="boutique">Boutique</option>
            <option value="institutional">Institutional</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Category</span>
          <input
            className="form-field"
            onChange={(event) => updateField("category", event.target.value)}
            placeholder="Media, policy, film, venture, research"
            value={formState.category}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Focus area</span>
          <input
            className="form-field"
            onChange={(event) => updateField("focusArea", event.target.value)}
            placeholder="What this organization researches, builds, or works on"
            value={formState.focusArea}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Location</span>
          <input
            className="form-field"
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="New York, NY"
            value={formState.location}
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-[var(--ink-soft)]">Summary</span>
          <textarea
            className="form-field min-h-28"
            onChange={(event) => updateField("summary", event.target.value)}
            placeholder="Why this organization matters and what makes it worth tracking"
            value={formState.summary}
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-[var(--ink-soft)]">Notes</span>
          <textarea
            className="form-field min-h-24"
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Optional research notes, collaboration angles, or internal context"
            value={formState.notes}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[#8d3f27]">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button className="cta-dark rounded-full px-5 py-3 text-sm transition" onClick={handleSubmit}>
          Save entry
        </button>
      </div>
    </Modal>
  );
}
