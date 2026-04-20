"use client";

import { useDeferredValue, useEffect, useState } from "react";

import financeSeed from "@/data/finance-firms.json";
import { fetchCrmRecords, upsertCrmRecord } from "@/lib/auth";
import {
  CRM_STORAGE_KEY,
  FINANCE_STORAGE_KEY,
  createCrmRecordFromFinanceFirm,
  createFinanceFirmFromInput,
  loadStoredItems,
  normalizeCrmRecord,
  saveStoredItems
} from "@/lib/utils";
import { CrmRecord, FinanceFirm, FinanceFirmInput } from "@/types";

import { AddFirmModal } from "./add-firm-modal";
import { FirmCard } from "./firm-card";
import { FirmListRow } from "./firm-list-row";
import { SearchFilterBar } from "./search-filter-bar";
import { ViewToggle } from "./view-toggle";

const financeSeedData = financeSeed as FinanceFirm[];

type TierKey =
  | "bulge-bracket"
  | "elite-boutique"
  | "independent-boutique"
  | "institutional-platform";

const bulgeBracketPatterns = [
  /goldman sachs/i,
  /morgan stanley/i,
  /bank of america/i,
  /\bcitigroup\b|\bciti\b/i,
  /barclays/i,
  /ubs/i,
  /deutsche bank/i,
  /j\.?\s?p\.?\s?morgan|jp morgan/i
];

const eliteBoutiquePatterns = [
  /evercore/i,
  /lazard/i,
  /moelis/i,
  /centerview/i,
  /pjt/i,
  /perella/i,
  /rothschild/i,
  /greenhill/i,
  /guggenheim/i,
  /jefferies/i,
  /qatalyst/i
];

const tierPresentation: Record<
  TierKey,
  {
    label: string;
    barClass: string;
    chipClass: string;
  }
> = {
  "bulge-bracket": {
    label: "Bulge bracket",
    barClass: "bg-[linear-gradient(90deg,#4ca7ff_0%,#79d3ff_100%)]",
    chipClass: "bg-[rgba(76,167,255,0.14)] text-[#165593]"
  },
  "elite-boutique": {
    label: "Elite boutique",
    barClass: "bg-[linear-gradient(90deg,#31c7c0_0%,#80efe2_100%)]",
    chipClass: "bg-[rgba(49,199,192,0.14)] text-[#0b6c67]"
  },
  "independent-boutique": {
    label: "Independent boutique",
    barClass: "bg-[linear-gradient(90deg,#f29a4a_0%,#ffd37f_100%)]",
    chipClass: "bg-[rgba(242,154,74,0.16)] text-[#9a4f11]"
  },
  "institutional-platform": {
    label: "Institutional platform",
    barClass: "bg-[linear-gradient(90deg,#8b95b8_0%,#c1c8e4_100%)]",
    chipClass: "bg-[rgba(139,149,184,0.16)] text-[#4a5477]"
  }
};

function matchesAny(patterns: RegExp[], value: string) {
  return patterns.some((pattern) => pattern.test(value));
}

function getFirmTier(firm: FinanceFirm): TierKey {
  const searchableName = [firm.name, ...firm.aliases].join(" ");

  if (matchesAny(bulgeBracketPatterns, searchableName)) {
    return "bulge-bracket";
  }

  if (matchesAny(eliteBoutiquePatterns, searchableName)) {
    return "elite-boutique";
  }

  if (firm.boutiqueStatus === "boutique") {
    return "independent-boutique";
  }

  return "institutional-platform";
}

function normalizeLocationLabel(location: string) {
  const cleaned = location.replace(/\s*\([^)]*\)/g, "").trim();

  if (!cleaned || cleaned.toLowerCase() === "location not provided") {
    return "Unspecified";
  }

  return cleaned;
}

export function FinanceDirectory() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [boutiqueFilter, setBoutiqueFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortValue, setSortValue] = useState("alphabetical");
  const [userFirms, setUserFirms] = useState<FinanceFirm[]>([]);
  const [crmRecords, setCrmRecords] = useState<CrmRecord[]>([]);
  const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const deferredSearch = useDeferredValue(searchValue);

  useEffect(() => {
    setUserFirms(loadStoredItems<FinanceFirm>(FINANCE_STORAGE_KEY));
    fetchCrmRecords()
      .then((records) => setCrmRecords(records.map((record) => normalizeCrmRecord(record))))
      .catch(() =>
        setCrmRecords(loadStoredItems<CrmRecord>(CRM_STORAGE_KEY).map((record) => normalizeCrmRecord(record)))
      );
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    saveStoredItems(FINANCE_STORAGE_KEY, userFirms);
  }, [hasHydrated, userFirms]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    saveStoredItems(CRM_STORAGE_KEY, crmRecords);
  }, [crmRecords, hasHydrated]);

  const allFirms = [...userFirms, ...financeSeedData];
  const crmRecordIds = new Set(
    crmRecords.filter((record) => record.sourceType === "finance").map((record) => record.id)
  );
  const categories = Array.from(new Set(allFirms.map((firm) => firm.category))).sort();
  const tierCounts = allFirms.reduce(
    (accumulator, firm) => {
      const tier = getFirmTier(firm);
      accumulator[tier] += 1;
      return accumulator;
    },
    {
      "bulge-bracket": 0,
      "elite-boutique": 0,
      "independent-boutique": 0,
      "institutional-platform": 0
    } satisfies Record<TierKey, number>
  );
  const maxTierCount = Math.max(...Object.values(tierCounts), 1);
  const tierStats = (Object.keys(tierCounts) as TierKey[]).map((tier) => ({
    key: tier,
    count: tierCounts[tier],
    width: `${(tierCounts[tier] / maxTierCount) * 100}%`,
    ...tierPresentation[tier]
  }));

  const locationCounts = allFirms.reduce<Record<string, number>>((accumulator, firm) => {
    const label = normalizeLocationLabel(firm.location);
    accumulator[label] = (accumulator[label] ?? 0) + 1;
    return accumulator;
  }, {});
  const locationStats = Object.entries(locationCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
  const maxLocationCount = Math.max(...locationStats.map((location) => location.count), 1);
  const leadingCategory = [...allFirms]
    .reduce<Record<string, number>>((accumulator, firm) => {
      accumulator[firm.category] = (accumulator[firm.category] ?? 0) + 1;
      return accumulator;
    }, {});
  const topCategories = Object.entries(leadingCategory)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const maxCategoryCount = Math.max(...topCategories.map(([, count]) => count), 1);

  const filteredFirms = allFirms
    .filter((firm) => {
      const matchesSearch =
        deferredSearch.trim() === "" ||
        [
          firm.name,
          firm.location,
          firm.category,
          firm.focusArea ?? "",
          firm.notes ?? "",
          firm.website,
          ...firm.aliases
        ]
          .join(" ")
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());

      const matchesBoutique =
        boutiqueFilter === "all" || firm.boutiqueStatus === boutiqueFilter;

      const matchesCategory = categoryFilter === "all" || firm.category === categoryFilter;

      return matchesSearch && matchesBoutique && matchesCategory;
    })
    .sort((left, right) => {
      if (sortValue === "boutique-first") {
        if (left.boutiqueStatus !== right.boutiqueStatus) {
          return left.boutiqueStatus === "boutique" ? -1 : 1;
        }
      }

      if (sortValue === "institutional-first") {
        if (left.boutiqueStatus !== right.boutiqueStatus) {
          return left.boutiqueStatus === "institutional" ? -1 : 1;
        }
      }

      if (sortValue === "recently-added") {
        return Number(Boolean(right.isUserAdded)) - Number(Boolean(left.isUserAdded));
      }

      return left.name.localeCompare(right.name);
    });

  function handleAddFirm(input: FinanceFirmInput) {
    setUserFirms((current) => [createFinanceFirmFromInput(input), ...current]);
  }

  function handleSaveToCrm(firm: FinanceFirm) {
    const nextRecord = normalizeCrmRecord(createCrmRecordFromFinanceFirm(firm));
    setCrmRecords((current) => {
      const nextRecords =
        current.some((record) => record.id === nextRecord.id) ? current : [nextRecord, ...current];

      saveStoredItems(CRM_STORAGE_KEY, nextRecords);
      void upsertCrmRecord(nextRecord).catch(() => undefined);
      return nextRecords;
    });
  }

  return (
    <>
      <section className="page-shell pb-20">
        <div className="grid items-start gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(135deg,#0a1824_0%,#143347_54%,#1d5b67_100%)] p-6 text-white shadow-[0_28px_90px_rgba(8,20,30,0.18)] md:p-8">
            <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-[#77efff]/10 blur-3xl" />
            <div className="pointer-events-none absolute left-10 top-28 h-44 w-44 rounded-full bg-[#f2b66d]/10 blur-3xl" />

            <div className="relative z-10">
              <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Finance Snapshot</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                <p className="display-title text-4xl font-semibold text-white">{allFirms.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Finance organizations</p>
                </div>
                <div>
                <p className="display-title text-4xl font-semibold text-white">{categories.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Categories represented so far</p>
                </div>
                <div>
                <p className="display-title text-4xl font-semibold text-white">{userFirms.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Community-added entries</p>
                </div>
              </div>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.74)]">
                Use the finance page to scan bulge bracket profiles, elite boutiques, independent shops,
                institutional platforms, and the cities that dominate the current map.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {topCategories.map(([category, count]) => (
                  <span
                    className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.82)]"
                    key={category}
                  >
                    {category} / {count}
                  </span>
                ))}
              </div>

              <div className="mt-9 grid gap-5 rounded-[1.55rem] border border-white/10 bg-white/[0.075] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur md:grid-cols-[1fr_0.72fr]">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow text-[0.68rem] text-[rgba(255,255,255,0.54)]">Category weight</p>
                    <p className="text-xs text-[rgba(255,255,255,0.48)]">Top 4</p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {topCategories.map(([category, count]) => (
                      <div key={`bar-${category}`}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="max-w-[14rem] truncate uppercase tracking-[0.16em] text-[rgba(255,255,255,0.72)]">
                            {category}
                          </span>
                          <span className="font-semibold text-white">{count}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#75e6ff_0%,#f3c66d_100%)]"
                            style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-[#071426]/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.52)]">
                    Recruiting map
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    {locationStats[0]?.label ?? "New York"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,255,255,0.66)]">
                    Current strongest location cluster, with CRM saves available directly from each firm card.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#edf7f7_100%)] p-6 shadow-[0_22px_65px_rgba(8,20,30,0.08)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Profile Mix</p>
                <span className="rounded-full bg-[rgba(12,33,48,0.05)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Live breakdown
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {tierStats.map((tier) => (
                  <div key={tier.key}>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tier.chipClass}`}>
                        {tier.label}
                      </span>
                      <span className="text-sm font-semibold text-[var(--ink)]">{tier.count}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[rgba(11,24,35,0.08)]">
                      <div className={`h-full rounded-full ${tier.barClass}`} style={{ width: tier.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5fb_100%)] p-6 shadow-[0_22px_65px_rgba(8,20,30,0.08)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Location Spread</p>
                <span className="rounded-full bg-[rgba(12,33,48,0.05)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Top locations
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {locationStats.map((location) => (
                  <div key={location.label}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-[var(--ink)]">{location.label}</span>
                      <span className="text-sm text-[var(--ink-soft)]">{location.count}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[rgba(11,24,35,0.08)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#2e71ff_0%,#5bc5e8_100%)]"
                        style={{ width: `${(location.count / maxLocationCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchFilterBar
            boutiqueFilter={boutiqueFilter}
            categories={categories}
            categoryFilter={categoryFilter}
            onAddFirm={() => setIsAddFirmOpen(true)}
            onBoutiqueFilterChange={setBoutiqueFilter}
            onCategoryFilterChange={setCategoryFilter}
            onSearchChange={setSearchValue}
            onSortChange={setSortValue}
            searchValue={searchValue}
            sortValue={sortValue}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#18536a]">
              Showing {filteredFirms.length} entries
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Switch between a scan-friendly grid and a polished list layout depending on whether you
              are researching recruiting targets, mapping the market, or collecting firms to revisit.
            </p>
          </div>
          <ViewToggle onChange={setViewMode} value={viewMode} />
        </div>

        {viewMode === "grid" ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredFirms.map((firm) => (
              <FirmCard
                crmRecordId={crmRecordIds.has(`finance-${firm.id}`) ? `finance-${firm.id}` : null}
                firm={firm}
                key={firm.id}
                onSaveToCrm={handleSaveToCrm}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {filteredFirms.map((firm) => (
              <FirmListRow
                crmRecordId={crmRecordIds.has(`finance-${firm.id}`) ? `finance-${firm.id}` : null}
                firm={firm}
                key={firm.id}
                onSaveToCrm={handleSaveToCrm}
              />
            ))}
          </div>
        )}

        {filteredFirms.length === 0 ? (
          <div className="surface-card mt-8 rounded-[1.8rem] p-8 text-center">
            <p className="display-title text-3xl font-semibold text-[var(--ink)]">No matches yet</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Try widening the search or add a new organization manually to extend the database.
            </p>
          </div>
        ) : null}
      </section>

      <AddFirmModal onClose={() => setIsAddFirmOpen(false)} onSubmit={handleAddFirm} open={isAddFirmOpen} />
    </>
  );
}
