"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/modal";
import { normalizeWebsite } from "@/lib/utils";
import { UniversityEcosystem, UniversityOpportunityInput } from "@/types";

type PostOpportunityModalProps = {
  open: boolean;
  ecosystems: UniversityEcosystem[];
  initialEcosystemId?: string;
  onClose: () => void;
  onSubmit: (input: UniversityOpportunityInput) => void;
};

export function PostOpportunityModal({
  open,
  ecosystems,
  initialEcosystemId,
  onClose,
  onSubmit
}: PostOpportunityModalProps) {
  const defaultEcosystem = ecosystems.find((entry) => entry.id === initialEcosystemId) ?? ecosystems[0];
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<UniversityOpportunityInput>({
    ecosystemId: defaultEcosystem?.id ?? "",
    ecosystem: defaultEcosystem?.name ?? "",
    projectRole: "",
    organization: "",
    website: "",
    location: defaultEcosystem?.region ?? "",
    opportunityType: "Project Role",
    description: "",
    applicationLink: "",
    contactEmail: ""
  });

  useEffect(() => {
    const nextEcosystem =
      ecosystems.find((entry) => entry.id === initialEcosystemId) ?? ecosystems[0];

    if (open && nextEcosystem) {
      setFormState({
        ecosystemId: nextEcosystem.id,
        ecosystem: nextEcosystem.name,
        projectRole: "",
        organization: "",
        website: "",
        location: nextEcosystem.region,
        opportunityType: "Project Role",
        description: "",
        applicationLink: "",
        contactEmail: ""
      });
      setError("");
    }
  }, [ecosystems, initialEcosystemId, open]);

  function update<K extends keyof UniversityOpportunityInput>(
    key: K,
    value: UniversityOpportunityInput[K]
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleEcosystemChange(ecosystemId: string) {
    const ecosystem = ecosystems.find((entry) => entry.id === ecosystemId);
    if (!ecosystem) {
      return;
    }

    setFormState((current) => ({
      ...current,
      ecosystemId: ecosystem.id,
      ecosystem: ecosystem.name,
      location: current.location || ecosystem.region
    }));
  }

  function handleSubmit() {
    if (!formState.projectRole.trim()) {
      setError("Project role is required.");
      return;
    }
    if (!formState.organization.trim()) {
      setError("Team or organization is required.");
      return;
    }
    if (!formState.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!normalizeWebsite(formState.applicationLink)) {
      setError("Please include a valid application link.");
      return;
    }
    if (!formState.contactEmail.trim()) {
      setError("Contact email is required.");
      return;
    }

    onSubmit({
      ...formState,
      website: normalizeWebsite(formState.website),
      applicationLink: normalizeWebsite(formState.applicationLink)
    });
    onClose();
  }

  return (
    <Modal
      description="Share research roles, build opportunities, or selective project openings inside the right university ecosystem."
      onClose={onClose}
      open={open}
      title="Post an opportunity"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Uni ecosystem</span>
          <select
            className="form-field"
            onChange={(event) => handleEcosystemChange(event.target.value)}
            value={formState.ecosystemId}
          >
            {ecosystems.map((ecosystem) => (
              <option key={ecosystem.id} value={ecosystem.id}>
                {ecosystem.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Project role</span>
          <input
            className="form-field"
            onChange={(event) => update("projectRole", event.target.value)}
            placeholder="Research fellow, venture scout, founding engineer"
            value={formState.projectRole}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Team or organization</span>
          <input
            className="form-field"
            onChange={(event) => update("organization", event.target.value)}
            placeholder="Studio, lab, startup, think tank, student team"
            value={formState.organization}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Website</span>
          <input
            className="form-field"
            onChange={(event) => update("website", event.target.value)}
            placeholder="https://example.com"
            value={formState.website}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Location</span>
          <input
            className="form-field"
            onChange={(event) => update("location", event.target.value)}
            placeholder="Remote or city"
            value={formState.location}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Opportunity type</span>
          <select
            className="form-field"
            onChange={(event) => update("opportunityType", event.target.value)}
            value={formState.opportunityType}
          >
            <option>Project Role</option>
            <option>Research Role</option>
            <option>Builder Residency</option>
            <option>Exclusive Working Opportunity</option>
            <option>Venture Internship</option>
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-[var(--ink-soft)]">Description</span>
          <textarea
            className="form-field min-h-28"
            onChange={(event) => update("description", event.target.value)}
            placeholder="What someone would research, build, test, or help move forward"
            value={formState.description}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Application link</span>
          <input
            className="form-field"
            onChange={(event) => update("applicationLink", event.target.value)}
            placeholder="https://example.com/apply"
            value={formState.applicationLink}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-[var(--ink-soft)]">Contact email</span>
          <input
            className="form-field"
            onChange={(event) => update("contactEmail", event.target.value)}
            placeholder="team@example.com"
            type="email"
            value={formState.contactEmail}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[#8d3f27]">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button className="cta-dark rounded-full px-5 py-3 text-sm transition" onClick={handleSubmit}>
          Publish opportunity
        </button>
      </div>
    </Modal>
  );
}
