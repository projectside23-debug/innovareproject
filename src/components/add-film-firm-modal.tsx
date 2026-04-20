"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/modal";
import { normalizeWebsite } from "@/lib/utils";
import { FilmFirmInput } from "@/types";

type AddFilmFirmModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: FilmFirmInput) => void;
};

const initialState: FilmFirmInput = {
  name: "",
  website: "",
  size: "small",
  city: "",
  state: "",
  region: "",
  focus: "Film production",
  address: "",
  summary: "",
  notes: ""
};

export function AddFilmFirmModal({ open, onClose, onSubmit }: AddFilmFirmModalProps) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormState(initialState);
      setError("");
    }
  }, [open]);

  function updateField<Key extends keyof FilmFirmInput>(key: Key, value: FilmFirmInput[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    const normalizedWebsite = normalizeWebsite(formState.website);
    if (!formState.name.trim()) {
      setError("Film company name is required.");
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
      description="Store a new film company locally so the production database can keep expanding without backend tooling."
      onClose={onClose}
      open={open}
      title="Add a film company"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Company name</span>
          <input
            className="form-field"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Studio, production house, banner"
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
          <span className="text-sm text-[var(--ink-soft)]">Company size</span>
          <select
            className="form-field"
            onChange={(event) => updateField("size", event.target.value as FilmFirmInput["size"])}
            value={formState.size}
          >
            <option value="small">Independent / small</option>
            <option value="large">Large studio / platform</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Focus</span>
          <input
            className="form-field"
            onChange={(event) => updateField("focus", event.target.value)}
            placeholder="Animation, production services, documentary"
            value={formState.focus}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">City</span>
          <input
            className="form-field"
            onChange={(event) => updateField("city", event.target.value)}
            placeholder="Los Angeles"
            value={formState.city}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">State</span>
          <input
            className="form-field"
            onChange={(event) => updateField("state", event.target.value)}
            placeholder="CA"
            value={formState.state}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Region</span>
          <input
            className="form-field"
            onChange={(event) => updateField("region", event.target.value)}
            placeholder="Pacific"
            value={formState.region}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Address</span>
          <input
            className="form-field"
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Optional street address or lot details"
            value={formState.address}
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-[var(--ink-soft)]">Summary</span>
          <textarea
            className="form-field min-h-28"
            onChange={(event) => updateField("summary", event.target.value)}
            placeholder="Why this company matters and what kind of film work it is known for"
            value={formState.summary}
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-[var(--ink-soft)]">Notes</span>
          <textarea
            className="form-field min-h-24"
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Optional notes on studio scale, specialties, or public context"
            value={formState.notes}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[#8d3f27]">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full bg-[linear-gradient(135deg,#2f170a_0%,#7c3d1f_100%)] px-5 py-3 text-sm text-white shadow-[0_20px_50px_rgba(73,36,19,0.18)] transition hover:-translate-y-0.5"
          onClick={handleSubmit}
        >
          Save film firm
        </button>
      </div>
    </Modal>
  );
}
