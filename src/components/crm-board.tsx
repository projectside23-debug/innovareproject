"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { type DragEvent, useEffect, useState } from "react";

import { CurvedPattern } from "@/components/curved-pattern";
import {
  JoinSession,
  deleteCrmRecord,
  fetchCrmRecords,
  fetchJoinSession,
  isValidEmail,
  loginWithNeon,
  upsertCrmRecord
} from "@/lib/auth";
import {
  buildCrmResearchSnapshot,
  buildMailtoHref,
  getPrimaryOutreachEmail,
  normalizeCrmRecord,
  normalizeCrmStatus
} from "@/lib/utils";
import { CrmOutreachStatus, CrmRecord } from "@/types";

const statusOrder: CrmOutreachStatus[] = [
  "saved",
  "sent",
  "follow-up-1",
  "follow-up-2",
  "follow-up-3",
  "successful",
  "failed"
];

const statusPresentation: Record<
  CrmOutreachStatus,
  {
    label: string;
    dotClass: string;
    columnClass: string;
  }
> = {
  saved: {
    label: "Saved",
    dotClass: "bg-[#86d7ff]",
    columnClass: "border-[rgba(134,215,255,0.18)] bg-[rgba(255,255,255,0.08)]"
  },
  sent: {
    label: "Email sent",
    dotClass: "bg-[#ffb066]",
    columnClass: "border-[rgba(255,176,102,0.2)] bg-[rgba(255,255,255,0.08)]"
  },
  "follow-up-1": {
    label: "Follow up email 1",
    dotClass: "bg-[#f8ce7a]",
    columnClass: "border-[rgba(248,206,122,0.2)] bg-[rgba(255,255,255,0.08)]"
  },
  "follow-up-2": {
    label: "Follow up email 2",
    dotClass: "bg-[#cdd790]",
    columnClass: "border-[rgba(205,215,144,0.2)] bg-[rgba(255,255,255,0.08)]"
  },
  "follow-up-3": {
    label: "Follow up email 3",
    dotClass: "bg-[#9ce0c7]",
    columnClass: "border-[rgba(156,224,199,0.2)] bg-[rgba(255,255,255,0.08)]"
  },
  successful: {
    label: "Successful",
    dotClass: "bg-[#4ade80]",
    columnClass: "border-[rgba(74,222,128,0.22)] bg-[rgba(255,255,255,0.08)]"
  },
  failed: {
    label: "Failed",
    dotClass: "bg-[#fb7185]",
    columnClass: "border-[rgba(251,113,133,0.24)] bg-[rgba(255,255,255,0.08)]"
  }
};

function formatSavedDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Added recently";
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.max(0, Math.round(diffMs / 86_400_000));

  if (diffDays === 0) {
    return "Added today";
  }

  if (diffDays === 1) {
    return "Added yesterday";
  }

  if (diffDays < 31) {
    return `Added ${diffDays} days ago`;
  }

  const diffMonths = Math.max(1, Math.round(diffDays / 30));
  return `Added ${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

function formatSourceLabel(record: CrmRecord) {
  return record.sourceType === "finance" ? "IB" : "Film";
}

export function CrmBoard() {
  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [session, setSession] = useState<JoinSession | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "finance" | "film">("all");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [draggingRecordId, setDraggingRecordId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateCrm() {
      try {
        const nextSession = await fetchJoinSession();
        if (!isMounted) {
          return;
        }

        setSession(nextSession);
        if (nextSession) {
          const serverRecords = await fetchCrmRecords();
          if (isMounted) {
            setRecords(serverRecords.map((record) => normalizeCrmRecord(record)));
          }
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setRecords([]);
        }
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    }

    hydrateCrm();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredRecords = [...records]
    .filter((record) => {
      const matchesSearch =
        normalizedSearch === "" ||
        [
          record.organization,
          record.location,
          record.segment,
          record.summary,
          record.companyEmail,
          record.contactName,
          record.contactRole,
          record.contactEmail,
          record.contactLinkedIn,
          record.notes,
          record.nextStep
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesSource = sourceFilter === "all" || record.sourceType === sourceFilter;
      return matchesSearch && matchesSource;
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  const activeRecord = records.find((record) => record.id === activeRecordId) ?? null;
  const activeResearch = activeRecord ? buildCrmResearchSnapshot(activeRecord) : null;
  const reachableCount = records.filter((record) => Boolean(getPrimaryOutreachEmail(record))).length;
  const successfulCount = records.filter((record) => record.status === "successful").length;

  async function handleLogin() {
    if (!loginName.trim()) {
      setLoginError("Name is required before using CRM.");
      return;
    }

    if (!isValidEmail(loginEmail)) {
      setLoginError("Please use a valid email before using CRM.");
      return;
    }

    if (loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const nextSession = await loginWithNeon({
        email: loginEmail.trim(),
        name: loginName.trim(),
        password: loginPassword
      });
      const serverRecords = await fetchCrmRecords();
      setSession(nextSession);
      setRecords(serverRecords.map((record) => normalizeCrmRecord(record)));
      setLoginPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function patchRecord(recordId: string, patch: Partial<CrmRecord>) {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== recordId) {
          return record;
        }

        const nextRecord = normalizeCrmRecord({
          ...record,
          ...patch,
          updatedAt: new Date().toISOString()
        });
        void upsertCrmRecord(nextRecord).catch(() => undefined);
        return nextRecord;
      })
    );
  }

  function removeRecord(recordId: string) {
    setRecords((current) => current.filter((record) => record.id !== recordId));
    void deleteCrmRecord(recordId).catch(() => undefined);
    if (activeRecordId === recordId) {
      setActiveRecordId(null);
    }
  }

  function moveRecord(recordId: string, nextStatus: CrmOutreachStatus) {
    patchRecord(recordId, { status: nextStatus });
  }

  function handleDragStart(event: DragEvent<HTMLElement>, recordId: string) {
    setDraggingRecordId(recordId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", recordId);
  }

  function handleDrop(event: DragEvent<HTMLElement>, nextStatus: CrmOutreachStatus) {
    event.preventDefault();
    const recordId = event.dataTransfer.getData("text/plain") || draggingRecordId;
    if (recordId) {
      moveRecord(recordId, nextStatus);
    }
    setDraggingRecordId(null);
  }

  function handleEmailClick(record: CrmRecord) {
    patchRecord(record.id, {
      status: "sent",
      lastContacted: new Date().toISOString().slice(0, 10)
    });
  }

  if (!hasHydrated) {
    return (
      <section className="page-shell pb-20">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#071426] p-8 text-white">
          <CurvedPattern />
          <p className="relative z-10">Loading CRM...</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="page-shell pb-20">
        <div className="relative overflow-hidden bg-[#071426] p-6 text-white shadow-[0_36px_100px_rgba(4,12,30,0.22)] md:p-10">
          <CurvedPattern />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-center">
            <div>
              <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Login before you begin</p>
              <h2 className="display-title mt-4 max-w-3xl text-4xl font-semibold text-white md:text-5xl">
                Sign in to open your CRM workspace.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.74)] md:text-base">
                Save firms, drag companies between stages, expand full-screen research cards, and track outreach
                once your Neon-backed Innovare session is active.
              </p>
            </div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] p-5 backdrop-blur-xl"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <label className="grid gap-2">
                <span className="text-sm text-[rgba(255,255,255,0.78)]">Name</span>
                <input
                  className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-3 text-white outline-none placeholder:text-[rgba(255,255,255,0.34)]"
                  onChange={(event) => setLoginName(event.target.value)}
                  placeholder="Your name"
                  value={loginName}
                />
              </label>
              <label className="mt-3 grid gap-2">
                <span className="text-sm text-[rgba(255,255,255,0.78)]">Email</span>
                <input
                  className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-3 text-white outline-none placeholder:text-[rgba(255,255,255,0.34)]"
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={loginEmail}
                />
              </label>
              <label className="mt-3 grid gap-2">
                <span className="text-sm text-[rgba(255,255,255,0.78)]">Password</span>
                <input
                  className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-3 text-white outline-none placeholder:text-[rgba(255,255,255,0.34)]"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  type="password"
                  value={loginPassword}
                />
              </label>
              {loginError ? <p className="mt-3 text-sm text-[#ffd0c4]">{loginError}</p> : null}
              <button
                className="mt-5 w-full bg-[linear-gradient(90deg,#ff8f52_0%,#248cff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(36,140,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoggingIn}
                onClick={handleLogin}
                type="button"
              >
                {isLoggingIn ? "Opening CRM..." : "Login and begin"}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell pb-20">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#071426] px-5 py-7 text-white shadow-[0_36px_100px_rgba(4,12,30,0.22)] md:px-7"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <CurvedPattern />

        <div className="relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">CRM Workspace</p>
              <h2 className="display-title mt-3 max-w-3xl text-4xl font-semibold text-white md:text-5xl">
                Drag saved companies through your outreach pipeline.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.74)]">
                Keep the board compact, then click any card for a full-screen research brief, contact fields,
                LinkedIn searches, and email actions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-3 backdrop-blur-xl">
                <p className="text-2xl font-semibold">{records.length}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.62)]">
                  Saved
                </p>
              </div>
              <div className="border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-3 backdrop-blur-xl">
                <p className="text-2xl font-semibold">{reachableCount}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.62)]">
                  Emails
                </p>
              </div>
              <div className="border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-3 backdrop-blur-xl">
                <p className="text-2xl font-semibold">{successfulCount}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.62)]">
                  Wins
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_14rem]">
            <input
              className="border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.09)] px-4 py-3 text-white outline-none placeholder:text-[rgba(255,255,255,0.42)]"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search saved companies, contacts, email, or notes"
              value={searchValue}
            />
            <select
              className="border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.09)] px-4 py-3 text-white outline-none"
              onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)}
              value={sourceFilter}
            >
              <option className="text-[var(--ink)]" value="all">
                All sources
              </option>
              <option className="text-[var(--ink)]" value="finance">
                Finance
              </option>
              <option className="text-[var(--ink)]" value="film">
                Film
              </option>
            </select>
          </div>
        </div>
      </motion.div>

      {records.length === 0 ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-8 overflow-hidden bg-[#071426] p-8 text-center text-white shadow-[0_20px_70px_rgba(10,20,32,0.12)]"
          initial={{ opacity: 0, y: 18 }}
          transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
        >
          <CurvedPattern />
          <div className="relative z-10">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">CRM is empty</p>
            <h3 className="display-title mt-4 text-3xl font-semibold text-white">
              Save firms from the private database to start.
            </h3>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link className="bg-white px-5 py-3 text-sm font-semibold text-[#071426] transition hover:-translate-y-0.5" href="/industry/finance">
                Browse finance
              </Link>
              <Link
                className="border border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.08)] px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
                href="/industry/film"
              >
                Browse film
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="grid min-w-[112rem] grid-cols-7 gap-4">
            {statusOrder.map((status) => {
              const presentation = statusPresentation[status];
              const columnRecords = filteredRecords.filter((record) => normalizeCrmStatus(record.status) === status);
              const isDropTarget = Boolean(draggingRecordId);

              return (
                <motion.section
                  className={`min-h-[17rem] border p-3 shadow-[0_20px_65px_rgba(7,20,38,0.08)] backdrop-blur-xl transition ${
                    presentation.columnClass
                  } ${isDropTarget ? "outline outline-1 outline-offset-2 outline-[rgba(36,140,255,0.18)]" : ""}`}
                  key={status}
                  layout
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, status)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 ${presentation.dotClass}`} />
                      <p className="text-sm font-semibold text-[var(--ink)]">{presentation.label}</p>
                    </div>
                    <span className="text-xs text-[var(--ink-soft)]">{columnRecords.length}</span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {columnRecords.length === 0 ? (
                      <div className="border border-dashed border-[rgba(11,24,35,0.14)] bg-white/60 px-3 py-8 text-center text-sm text-[var(--ink-soft)]">
                        Drop here
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {columnRecords.map((record) => (
                          <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            initial={{ opacity: 0, scale: 0.97 }}
                            key={record.id}
                            layout
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            whileHover={{ y: -2 }}
                          >
                            <article
                              className="cursor-grab bg-white shadow-[0_12px_35px_rgba(10,20,32,0.08)] active:cursor-grabbing"
                              draggable
                              onDragEnd={() => setDraggingRecordId(null)}
                              onDragStart={(event) => handleDragStart(event, record.id)}
                            >
                              <button
                                className="grid w-full grid-cols-[3.75rem_1fr] gap-3 p-3 text-left transition hover:bg-[rgba(245,248,252,0.92)]"
                                onClick={() => setActiveRecordId(record.id)}
                                type="button"
                              >
                                <span className="flex h-14 w-14 items-center justify-center border border-[rgba(11,24,35,0.08)] bg-[rgba(245,248,252,0.95)] text-sm font-semibold text-[rgba(11,24,35,0.48)]">
                                  {formatSourceLabel(record)}
                                </span>
                                <span>
                                  <span className="block text-base font-semibold leading-6 text-[var(--ink)]">
                                    {record.organization}
                                  </span>
                                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[var(--ink-soft)]">
                                    {record.segment}
                                  </span>
                                  <span className="mt-3 block text-xs text-[rgba(11,24,35,0.56)]">
                                    {formatSavedDate(record.savedAt)}
                                  </span>
                                </span>
                              </button>
                            </article>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeRecord && activeResearch ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] bg-[rgba(3,8,15,0.72)] p-3 backdrop-blur-md md:p-6"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <button
              aria-label="Close CRM detail"
              className="absolute inset-0 cursor-default"
              onClick={() => setActiveRecordId(null)}
              type="button"
            />

            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 mx-auto flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.4rem] bg-white shadow-[0_44px_120px_rgba(0,0,0,0.34)]"
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden bg-[#071426] p-6 text-white md:p-8">
                <CurvedPattern />
                <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="eyebrow text-xs text-[rgba(255,255,255,0.6)]">
                      {statusPresentation[activeRecord.status].label} / {formatSourceLabel(activeRecord)}
                    </p>
                    <h3 className="display-title mt-3 text-4xl font-semibold text-white md:text-5xl">
                      {activeRecord.organization}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgba(255,255,255,0.74)]">
                      {activeRecord.location} / {activeRecord.segment}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      className="bg-white px-4 py-3 text-sm font-semibold text-[#071426] transition hover:-translate-y-0.5"
                      href={activeRecord.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Website
                    </a>
                    <button
                      className="border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      onClick={() => setActiveRecordId(null)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-7">
                <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
                  <div className="grid gap-5">
                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-[rgba(245,248,252,0.78)] p-5">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        GPT-style research brief
                      </p>
                      <div className="mt-4 grid gap-3">
                        {activeResearch.messages.map((message) => (
                          <div
                            className="whitespace-pre-wrap rounded-[1.1rem] border border-[rgba(11,24,35,0.08)] bg-white p-4 text-sm leading-6 text-[var(--ink)]"
                            key={message.id}
                          >
                            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#17616a]">
                              Innovare AI
                            </span>
                            {message.content}
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="grid gap-5 md:grid-cols-2">
                      <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                          Verify before outreach
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
                          This CRM does not invent company details. Use these searches to confirm what the company actually does,
                          recent activity, and the best person to contact before sending.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            className="rounded-full border border-[rgba(23,97,106,0.18)] bg-[rgba(60,169,179,0.08)] px-3 py-2 text-xs font-semibold text-[#17616a]"
                            href={activeResearch.latestNewsSearchUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Latest news
                          </a>
                          <a
                            className="rounded-full border border-[rgba(23,97,106,0.18)] bg-[rgba(60,169,179,0.08)] px-3 py-2 text-xs font-semibold text-[#17616a]"
                            href={activeResearch.companyLinkedInSearchUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Company LinkedIn
                          </a>
                          <a
                            className="rounded-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]"
                            href={activeRecord.website}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Website
                          </a>
                        </div>
                      </section>

                      <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                            Evidence-based snapshot
                          </p>
                          <span className="rounded-full bg-[rgba(217,141,76,0.1)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#8b451f]">
                            {activeResearch.evidenceLevel} evidence
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
                          <span className="font-semibold">What they do:</span> {activeResearch.companyDescription}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
                          <span className="font-semibold">What makes them different:</span> {activeResearch.differentiator}
                        </p>
                      </section>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                          Verified from database
                        </p>
                        <div className="mt-4 grid gap-2">
                          {activeResearch.verifiedEvidence.length > 0 ? (
                            activeResearch.verifiedEvidence.map((item) => (
                              <p className="rounded-[1rem] bg-[rgba(245,248,252,0.82)] p-3 text-sm leading-6 text-[var(--ink)]" key={item}>
                                {item}
                              </p>
                            ))
                          ) : (
                            <p className="rounded-[1rem] bg-[rgba(245,248,252,0.82)] p-3 text-sm leading-6 text-[var(--ink-soft)]">
                              No strong company evidence yet. Open the website and paste verified notes before sending.
                            </p>
                          )}
                        </div>
                      </section>

                      <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                          Missing before outreach
                        </p>
                        <div className="mt-4 grid gap-2">
                          {activeResearch.researchGaps.slice(0, 4).map((gap) => (
                            <p className="rounded-[1rem] bg-[rgba(255,246,235,0.92)] p-3 text-sm leading-6 text-[var(--ink)]" key={gap}>
                              {gap}
                            </p>
                          ))}
                        </div>
                      </section>
                    </div>

                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Outreach angles
                      </p>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {activeResearch.outreachAngles.map((angle) => (
                          <p className="rounded-[1rem] border border-[rgba(23,97,106,0.12)] bg-[rgba(60,169,179,0.06)] p-3 text-sm leading-6 text-[var(--ink)]" key={angle}>
                            {angle}
                          </p>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Important people to research
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {activeResearch.contactCandidates.slice(0, 3).map((candidate) => (
                          <div className="rounded-[1.1rem] border border-[rgba(11,24,35,0.08)] bg-[rgba(245,248,252,0.72)] p-4" key={candidate.role}>
                            <p className="text-sm font-semibold text-[var(--ink)]">{candidate.role}</p>
                            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">{candidate.reason}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                className="text-xs font-semibold text-[#17616a]"
                                href={candidate.linkedinSearchUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                LinkedIn search
                              </a>
                              <a
                                className="text-xs font-semibold text-[#8b451f]"
                                href={candidate.webSearchUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                Web search
                              </a>
                              <button
                                className="text-xs font-semibold text-[#071426]"
                                onClick={() =>
                                  patchRecord(activeRecord.id, {
                                    contactRole: candidate.role,
                                    contactEmail: activeRecord.contactEmail || candidate.suggestedEmail
                                  })
                                }
                                type="button"
                              >
                                Use role
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="grid content-start gap-4">
                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-[rgba(245,248,252,0.78)] p-5">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Stage
                      </p>
                      <select
                        className="mt-3 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) =>
                          patchRecord(activeRecord.id, {
                            status: event.target.value as CrmOutreachStatus
                          })
                        }
                        value={activeRecord.status}
                      >
                        {statusOrder.map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            {statusPresentation[nextStatus].label}
                          </option>
                        ))}
                      </select>
                    </section>

                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Actual email contacts
                      </p>
                      <div className="mt-4 grid gap-3">
                        <input
                          className="border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                          onChange={(event) => patchRecord(activeRecord.id, { companyEmail: event.target.value })}
                          placeholder="Company email"
                          type="email"
                          value={activeRecord.companyEmail}
                        />
                        <input
                          className="border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                          onChange={(event) => patchRecord(activeRecord.id, { contactName: event.target.value })}
                          placeholder="Verified contact name"
                          value={activeRecord.contactName}
                        />
                        <input
                          className="border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                          onChange={(event) => patchRecord(activeRecord.id, { contactRole: event.target.value })}
                          placeholder="Verified contact role"
                          value={activeRecord.contactRole}
                        />
                        <input
                          className="border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                          onChange={(event) => patchRecord(activeRecord.id, { contactEmail: event.target.value })}
                          placeholder="Verified contact email"
                          type="email"
                          value={activeRecord.contactEmail}
                        />
                        <input
                          className="border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                          onChange={(event) => patchRecord(activeRecord.id, { contactLinkedIn: event.target.value })}
                          placeholder="Verified LinkedIn URL"
                          value={activeRecord.contactLinkedIn}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeResearch.companyEmailCandidates.map((email) => (
                          <button
                            className="rounded-full border border-[rgba(23,97,106,0.18)] bg-[rgba(60,169,179,0.08)] px-3 py-2 text-xs font-medium text-[#17616a]"
                            key={email}
                            onClick={() => patchRecord(activeRecord.id, { companyEmail: email })}
                            type="button"
                          >
                            Use {email}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Follow-up notes
                      </p>
                      <input
                        className="mt-4 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) => patchRecord(activeRecord.id, { nextStep: event.target.value })}
                        placeholder="Next step"
                        value={activeRecord.nextStep}
                      />
                      <input
                        className="mt-3 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) => patchRecord(activeRecord.id, { lastContacted: event.target.value })}
                        type="date"
                        value={activeRecord.lastContacted?.slice(0, 10) ?? ""}
                      />
                      <textarea
                        className="mt-3 min-h-28 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) => patchRecord(activeRecord.id, { notes: event.target.value })}
                        placeholder="Notes, latest verified update, or follow-up context"
                        value={activeRecord.notes}
                      />
                    </section>

                    <section className="rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] bg-white p-5 shadow-[0_16px_50px_rgba(10,20,32,0.06)]">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Outreach draft
                      </p>
                      <button
                        className="mt-4 w-full rounded-[1rem] border border-[rgba(217,141,76,0.2)] bg-[rgba(217,141,76,0.08)] px-3 py-3 text-left text-sm font-semibold leading-6 text-[#8b451f] transition hover:bg-[rgba(217,141,76,0.12)]"
                        onClick={() =>
                          patchRecord(activeRecord.id, {
                            emailSubject: activeResearch.outreachTemplateSubject,
                            outreachDraft: activeResearch.outreachTemplateBody
                          })
                        }
                        type="button"
                      >
                        Use unpaid summer opportunity template
                      </button>
                      <input
                        className="mt-4 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) => patchRecord(activeRecord.id, { emailSubject: event.target.value })}
                        placeholder="Email subject"
                        value={activeRecord.emailSubject}
                      />
                      <textarea
                        className="mt-3 min-h-32 w-full border border-[rgba(11,24,35,0.12)] bg-white px-3 py-3 text-sm outline-none"
                        onChange={(event) => patchRecord(activeRecord.id, { outreachDraft: event.target.value })}
                        value={activeRecord.outreachDraft}
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        {getPrimaryOutreachEmail(activeRecord) ? (
                          <a
                            className="bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                            href={buildMailtoHref(activeRecord)}
                            onClick={() => handleEmailClick(activeRecord)}
                          >
                            Send email
                          </a>
                        ) : null}
                        <button
                          className="border border-[rgba(141,63,39,0.18)] bg-[rgba(141,63,39,0.08)] px-4 py-3 text-sm font-semibold text-[#8d3f27] transition hover:-translate-y-0.5"
                          onClick={() => removeRecord(activeRecord.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </section>
                  </aside>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
