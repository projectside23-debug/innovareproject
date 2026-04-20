"use client";

import { useDeferredValue, useEffect, useState } from "react";

import filmSeed from "@/data/film-firms.json";
import { fetchCrmRecords, upsertCrmRecord } from "@/lib/auth";
import {
  CRM_STORAGE_KEY,
  FILM_STORAGE_KEY,
  createCrmRecordFromFilmFirm,
  createFilmFirmFromInput,
  loadStoredItems,
  normalizeCrmRecord,
  saveStoredItems
} from "@/lib/utils";
import { CrmRecord, FilmFirm, FilmFirmInput } from "@/types";

import { AddFilmFirmModal } from "./add-film-firm-modal";
import { FilmCard } from "./film-card";
import { FilmListRow } from "./film-list-row";
import { FilmSearchFilterBar } from "./film-search-filter-bar";
import { ViewToggle } from "./view-toggle";

const filmSeedData = filmSeed as FilmFirm[];

const sizePresentation = {
  large: {
    label: "Large studios",
    barClass: "bg-[linear-gradient(90deg,#a35224_0%,#f0aa63_100%)]",
    chipClass: "bg-[rgba(163,82,36,0.14)] text-[#8b451f]"
  },
  small: {
    label: "Independent / small",
    barClass: "bg-[linear-gradient(90deg,#5f4d80_0%,#b093da_100%)]",
    chipClass: "bg-[rgba(95,77,128,0.14)] text-[#52406d]"
  }
} as const;

export function FilmDirectory() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortValue, setSortValue] = useState("alphabetical");
  const [userFirms, setUserFirms] = useState<FilmFirm[]>([]);
  const [crmRecords, setCrmRecords] = useState<CrmRecord[]>([]);
  const [isAddFilmOpen, setIsAddFilmOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const deferredSearch = useDeferredValue(searchValue);

  useEffect(() => {
    setUserFirms(loadStoredItems<FilmFirm>(FILM_STORAGE_KEY));
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

    saveStoredItems(FILM_STORAGE_KEY, userFirms);
  }, [hasHydrated, userFirms]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    saveStoredItems(CRM_STORAGE_KEY, crmRecords);
  }, [crmRecords, hasHydrated]);

  const allFirms = [...userFirms, ...filmSeedData];
  const crmRecordIds = new Set(
    crmRecords.filter((record) => record.sourceType === "film").map((record) => record.id)
  );
  const regions = Array.from(new Set(allFirms.map((firm) => firm.region))).sort();
  const focusCounts = allFirms.reduce<Record<string, number>>((accumulator, firm) => {
    accumulator[firm.focus] = (accumulator[firm.focus] ?? 0) + 1;
    return accumulator;
  }, {});
  const topFocuses = Object.entries(focusCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const sizeCounts = allFirms.reduce(
    (accumulator, firm) => {
      accumulator[firm.size] += 1;
      return accumulator;
    },
    { large: 0, small: 0 }
  );
  const maxSizeCount = Math.max(...Object.values(sizeCounts), 1);
  const sizeStats = (Object.keys(sizeCounts) as Array<keyof typeof sizeCounts>).map((size) => ({
    key: size,
    count: sizeCounts[size],
    width: `${(sizeCounts[size] / maxSizeCount) * 100}%`,
    ...sizePresentation[size]
  }));

  const regionCounts = allFirms.reduce<Record<string, number>>((accumulator, firm) => {
    accumulator[firm.region] = (accumulator[firm.region] ?? 0) + 1;
    return accumulator;
  }, {});
  const regionStats = Object.entries(regionCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
  const maxRegionCount = Math.max(...regionStats.map((region) => region.count), 1);

  const filteredFirms = allFirms
    .filter((firm) => {
      const matchesSearch =
        deferredSearch.trim() === "" ||
        [
          firm.name,
          firm.city,
          firm.state,
          firm.region,
          firm.focus,
          firm.address ?? "",
          firm.notes ?? "",
          firm.website
        ]
          .join(" ")
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());

      const matchesSize = sizeFilter === "all" || firm.size === sizeFilter;
      const matchesRegion = regionFilter === "all" || firm.region === regionFilter;

      return matchesSearch && matchesSize && matchesRegion;
    })
    .sort((left, right) => {
      if (sortValue === "large-first" && left.size !== right.size) {
        return left.size === "large" ? -1 : 1;
      }

      if (sortValue === "small-first" && left.size !== right.size) {
        return left.size === "small" ? -1 : 1;
      }

      if (sortValue === "recently-added") {
        return Number(Boolean(right.isUserAdded)) - Number(Boolean(left.isUserAdded));
      }

      return left.name.localeCompare(right.name);
    });

  function handleAddFilmFirm(input: FilmFirmInput) {
    setUserFirms((current) => [createFilmFirmFromInput(input), ...current]);
  }

  function handleSaveToCrm(firm: FilmFirm) {
    const nextRecord = normalizeCrmRecord(createCrmRecordFromFilmFirm(firm));
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
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[rgba(78,39,19,0.08)] bg-[linear-gradient(135deg,#221109_0%,#4a2716_52%,#8b4a25_100%)] p-6 text-white shadow-[0_28px_90px_rgba(61,32,17,0.18)] md:p-8">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Film Snapshot</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="display-title text-4xl font-semibold text-white">{allFirms.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Film companies</p>
              </div>
              <div>
                <p className="display-title text-4xl font-semibold text-white">{regions.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Regions represented</p>
              </div>
              <div>
                <p className="display-title text-4xl font-semibold text-white">{userFirms.length}</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">Community-added entries</p>
              </div>
            </div>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.74)]">
              Use the film page to scan studio scale, regional concentration, and production companies
              with public websites across New York, California, and the broader U.S. market.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {topFocuses.map(([focus, count]) => (
                <span
                  className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.82)]"
                  key={focus}
                >
                  {focus} / {count}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-[rgba(78,39,19,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#fbf2eb_100%)] p-6 shadow-[0_22px_65px_rgba(61,32,17,0.08)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Studio Scale</p>
                <span className="rounded-full bg-[rgba(78,39,19,0.05)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Live breakdown
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {sizeStats.map((size) => (
                  <div key={size.key}>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${size.chipClass}`}>
                        {size.label}
                      </span>
                      <span className="text-sm font-semibold text-[var(--ink)]">{size.count}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[rgba(11,24,35,0.08)]">
                      <div className={`h-full rounded-full ${size.barClass}`} style={{ width: size.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[rgba(78,39,19,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f8efe9_100%)] p-6 shadow-[0_22px_65px_rgba(61,32,17,0.08)] md:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Regional Spread</p>
                <span className="rounded-full bg-[rgba(78,39,19,0.05)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Top regions
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {regionStats.map((region) => (
                  <div key={region.label}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-[var(--ink)]">{region.label}</span>
                      <span className="text-sm text-[var(--ink-soft)]">{region.count}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[rgba(11,24,35,0.08)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#a35224_0%,#f0aa63_100%)]"
                        style={{ width: `${(region.count / maxRegionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FilmSearchFilterBar
            onAddFirm={() => setIsAddFilmOpen(true)}
            onRegionFilterChange={setRegionFilter}
            onSearchChange={setSearchValue}
            onSizeFilterChange={setSizeFilter}
            onSortChange={setSortValue}
            regionFilter={regionFilter}
            regions={regions}
            searchValue={searchValue}
            sizeFilter={sizeFilter}
            sortValue={sortValue}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#8b451f]">
              Showing {filteredFirms.length} entries
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Switch between grid and list views depending on whether you are scanning film markets,
              researching studios, or collecting production companies to revisit later.
            </p>
          </div>
          <ViewToggle onChange={setViewMode} value={viewMode} />
        </div>

        {viewMode === "grid" ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredFirms.map((firm) => (
              <FilmCard
                crmRecordId={crmRecordIds.has(`film-${firm.id}`) ? `film-${firm.id}` : null}
                firm={firm}
                key={firm.id}
                onSaveToCrm={handleSaveToCrm}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {filteredFirms.map((firm) => (
              <FilmListRow
                crmRecordId={crmRecordIds.has(`film-${firm.id}`) ? `film-${firm.id}` : null}
                firm={firm}
                key={firm.id}
                onSaveToCrm={handleSaveToCrm}
              />
            ))}
          </div>
        )}

        {filteredFirms.length === 0 ? (
          <div className="surface-card mt-8 rounded-[1.8rem] p-8 text-center">
            <p className="display-title text-3xl font-semibold text-[var(--ink)]">No film matches yet</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Try widening the filters or add a new production company manually to extend the film page.
            </p>
          </div>
        ) : null}
      </section>

      <AddFilmFirmModal
        onClose={() => setIsAddFilmOpen(false)}
        onSubmit={handleAddFilmFirm}
        open={isAddFilmOpen}
      />
    </>
  );
}
