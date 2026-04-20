"use client";

import { useEffect, useState } from "react";

import ecosystemsSeed from "@/data/university-ecosystems.json";
import opportunitiesSeed from "@/data/university-opportunities.json";
import {
  UNIVERSITY_OPPORTUNITIES_STORAGE_KEY,
  createUniversityOpportunityFromInput,
  loadStoredItems,
  saveStoredItems
} from "@/lib/utils";
import {
  UniversityEcosystem,
  UniversityOpportunity,
  UniversityOpportunityInput
} from "@/types";

import { PostOpportunityModal } from "./post-opportunity-modal";

const ecosystemSeedData = ecosystemsSeed as UniversityEcosystem[];
const opportunitySeedData = opportunitiesSeed as UniversityOpportunity[];

const ecosystemThemes: Record<
  string,
  {
    cardClass: string;
    overlayClass: string;
    titleClass: string;
    metaClass: string;
    bodyClass: string;
    badgeClass: string;
  }
> = {
  duke: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#001a57_0%,#003087_58%,#275dbe_100%)] shadow-[0_24px_70px_rgba(0,39,102,0.2)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.82)]",
    bodyClass: "text-[rgba(255,255,255,0.76)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  },
  nyu: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#4d127f_0%,#6e1ea7_56%,#8b39c2_100%)] shadow-[0_24px_70px_rgba(65,18,112,0.18)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.82)]",
    bodyClass: "text-[rgba(255,255,255,0.76)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  },
  columbia: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#0f4d7f_0%,#2d7fb3_54%,#69b5e6_100%)] shadow-[0_24px_70px_rgba(24,93,145,0.18)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.84)]",
    bodyClass: "text-[rgba(255,255,255,0.78)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  },
  penn: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#7b1236_0%,#9f1f42_48%,#072a60_100%)] shadow-[0_24px_70px_rgba(79,17,55,0.18)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.82)]",
    bodyClass: "text-[rgba(255,255,255,0.76)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  },
  berkeley: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#002f62_0%,#0d4a8c_54%,#c7921e_120%)] shadow-[0_24px_70px_rgba(0,47,98,0.2)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,210,120,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.84)]",
    bodyClass: "text-[rgba(255,255,255,0.78)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  },
  northwestern: {
    cardClass:
      "border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#3b1b6b_0%,#4e2a84_54%,#7750c2_100%)] shadow-[0_24px_70px_rgba(59,27,107,0.18)]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]",
    titleClass: "text-white",
    metaClass: "text-[rgba(255,255,255,0.82)]",
    bodyClass: "text-[rgba(255,255,255,0.76)]",
    badgeClass:
      "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.16)] text-white"
  }
};

export function UniversityOpportunitiesBoard() {
  const [userOpportunities, setUserOpportunities] = useState<UniversityOpportunity[]>([]);
  const [selectedEcosystemId, setSelectedEcosystemId] = useState<string>("all");
  const [postingEcosystemId, setPostingEcosystemId] = useState<string | undefined>(undefined);
  const [isPostOpportunityOpen, setIsPostOpportunityOpen] = useState(false);

  useEffect(() => {
    setUserOpportunities(
      loadStoredItems<UniversityOpportunity>(UNIVERSITY_OPPORTUNITIES_STORAGE_KEY)
    );
  }, []);

  useEffect(() => {
    saveStoredItems(UNIVERSITY_OPPORTUNITIES_STORAGE_KEY, userOpportunities);
  }, [userOpportunities]);

  const allOpportunities = [...userOpportunities, ...opportunitySeedData].sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime()
  );

  const visibleOpportunities =
    selectedEcosystemId === "all"
      ? allOpportunities
      : allOpportunities.filter((opportunity) => opportunity.ecosystemId === selectedEcosystemId);

  function openModal(ecosystemId?: string) {
    setPostingEcosystemId(ecosystemId);
    setIsPostOpportunityOpen(true);
  }

  function handleSubmit(input: UniversityOpportunityInput) {
    setUserOpportunities((current) => [createUniversityOpportunityFromInput(input), ...current]);
  }

  return (
    <>
      <section className="page-shell pb-20">
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-card rounded-[2rem] p-6 md:p-8">
            <p className="eyebrow text-xs text-[var(--ink-soft)]">University Ecosystems</p>
            <h2 className="display-title mt-4 text-4xl font-semibold text-[var(--ink)]">
              Startup help, project-based work, and selective opportunities across campuses.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              This board is intentionally empty to start. It is meant to be filled by people sharing
              startup roles, project-based tasks, early venture help, and opportunities to grow or
              work inside a startup.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedEcosystemId === "all"
                    ? "cta-dark"
                    : "cta-light text-[var(--ink-soft)] hover:bg-white"
                }`}
                onClick={() => setSelectedEcosystemId("all")}
                type="button"
              >
                All ecosystems
              </button>
              {ecosystemSeedData.map((ecosystem) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedEcosystemId === ecosystem.id
                      ? "cta-dark"
                      : "cta-light text-[var(--ink-soft)] hover:bg-white"
                  }`}
                  key={ecosystem.id}
                  onClick={() => setSelectedEcosystemId(ecosystem.id)}
                  type="button"
                >
                  {ecosystem.name}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              {ecosystemSeedData.map((ecosystem) => {
                const count = allOpportunities.filter(
                  (opportunity) => opportunity.ecosystemId === ecosystem.id
                ).length;
                const theme = ecosystemThemes[ecosystem.id];

                return (
                  <button
                    className={`relative overflow-hidden rounded-[1.4rem] p-4 text-left transition hover:-translate-y-0.5 ${
                      theme
                        ? theme.cardClass
                        : "surface-panel hover:bg-[rgba(255,255,255,0.92)]"
                    }`}
                    key={ecosystem.id}
                    onClick={() => setSelectedEcosystemId(ecosystem.id)}
                    type="button"
                  >
                    {theme ? (
                      <div className={`absolute inset-0 ${theme.overlayClass}`} />
                    ) : null}

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`display-title text-2xl font-semibold ${
                            theme ? theme.titleClass : "text-[var(--ink)]"
                          }`}
                        >
                          {ecosystem.name}
                        </p>
                        <p
                          className={`mt-2 text-sm ${
                            theme ? theme.metaClass : "text-[var(--ink-soft)]"
                          }`}
                        >
                          {ecosystem.focus}
                        </p>
                      </div>
                      <span className={`tag ${theme ? theme.badgeClass : "tag-strong"}`}>{count}</span>
                    </div>
                    <p
                      className={`relative z-10 mt-3 text-sm leading-6 ${
                        theme ? theme.bodyClass : "text-[var(--ink-soft)]"
                      }`}
                    >
                      {ecosystem.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Opportunity Board</p>
                <h3 className="display-title mt-3 text-4xl font-semibold text-[var(--ink)]">
                  University opportunities should start with intent, not noise.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Share opportunities for people who want to help build a startup, take on
                  project-based tasks, or join selective working environments around university ecosystems.
                </p>
              </div>

              <button
                className="cta-dark rounded-full px-5 py-3 text-sm transition"
                onClick={() =>
                  openModal(
                    selectedEcosystemId !== "all" ? selectedEcosystemId : ecosystemSeedData[0]?.id
                  )
                }
              >
                Post an opportunity
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-4">
                <p className="text-3xl font-semibold text-[var(--ink)]">{allOpportunities.length}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Published opportunities</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-4">
                <p className="text-3xl font-semibold text-[var(--ink)]">{ecosystemSeedData.length}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Ecosystems available to post into</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-4">
                <p className="text-3xl font-semibold text-[var(--ink)]">{userOpportunities.length}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Community-submitted roles</p>
              </div>
            </div>

            {visibleOpportunities.length > 0 ? (
              <div className="mt-8 grid gap-4">
                {visibleOpportunities.map((opportunity) => (
                  <article className="surface-panel rounded-[1.5rem] p-5" key={opportunity.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap gap-2">
                          <span className="tag tag-strong">{opportunity.ecosystem}</span>
                          <span className="tag">{opportunity.opportunityType}</span>
                        </div>
                        <h4 className="display-title mt-4 text-3xl font-semibold text-[var(--ink)]">
                          {opportunity.projectRole}
                        </h4>
                        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                          {opportunity.organization}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                          {opportunity.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2 text-sm text-[var(--ink-soft)] md:grid-cols-2">
                      <p>
                        <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Location</span>
                        <span className="text-[var(--ink)]">{opportunity.location}</span>
                      </p>
                      <p>
                        <span className="mr-2 uppercase tracking-[0.16em] text-[0.72rem]">Contact</span>
                        <span className="text-[var(--ink)]">{opportunity.contactEmail}</span>
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        className="cta-dark rounded-full px-4 py-2.5 text-sm transition"
                        href={opportunity.applicationLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Apply
                      </a>
                      {opportunity.website ? (
                        <a
                          className="cta-light rounded-full px-4 py-2.5 text-sm transition hover:bg-white"
                          href={opportunity.website}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Visit organization
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.8rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-8 text-center">
                <p className="display-title text-3xl font-semibold text-[var(--ink)]">
                  No opportunities yet
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  Start by posting a startup role, project-based task, or selective working
                  opportunity. The board is intentionally open so the ecosystem can define what matters.
                </p>
                <button
                  className="cta-dark mt-6 rounded-full px-5 py-3 text-sm transition"
                  onClick={() => openModal(ecosystemSeedData[0]?.id)}
                >
                  Add the first opportunity
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <PostOpportunityModal
        ecosystems={ecosystemSeedData}
        initialEcosystemId={postingEcosystemId}
        onClose={() => setIsPostOpportunityOpen(false)}
        onSubmit={handleSubmit}
        open={isPostOpportunityOpen}
      />
    </>
  );
}
