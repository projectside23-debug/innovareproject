import { CrmRecord, UniversityOpportunity, UniversityOpportunityInput } from "@/types";

export type JoinSession = {
  id?: string;
  name: string;
  email: string;
};

export type LoginInput = {
  name: string;
  email: string;
  password: string;
};

export const JOIN_TEAM_STORAGE_KEY = "innovare-join-team-session";

export function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function loadJoinSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedValue = window.localStorage.getItem(JOIN_TEAM_STORAGE_KEY);
    if (!savedValue) {
      return null;
    }

    const parsed = JSON.parse(savedValue) as JoinSession;
    return parsed?.name && parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function saveJoinSession(session: JoinSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(JOIN_TEAM_STORAGE_KEY, JSON.stringify(session));
}

export function clearJoinSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(JOIN_TEAM_STORAGE_KEY);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function fetchJoinSession() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store"
  });
  const data = await readJsonResponse<{ configured?: boolean; user: JoinSession | null }>(response);
  return data.user;
}

export async function loginWithNeon(input: LoginInput) {
  const response = await fetch("/api/auth/session", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = await readJsonResponse<{ user: JoinSession }>(response);
  saveJoinSession(data.user);
  return data.user;
}

export async function clearServerSession() {
  await fetch("/api/auth/session", {
    method: "DELETE"
  });
  clearJoinSession();
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  const response = await fetch("/api/contact", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  await readJsonResponse<{ ok: true }>(response);
}

export async function fetchCrmRecords() {
  const response = await fetch("/api/crm", {
    cache: "no-store"
  });
  const data = await readJsonResponse<{ records: CrmRecord[] }>(response);
  return data.records;
}

export async function upsertCrmRecord(record: CrmRecord) {
  const response = await fetch("/api/crm", {
    body: JSON.stringify(record),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = await readJsonResponse<{ record: CrmRecord }>(response);
  return data.record;
}

export async function deleteCrmRecord(recordId: string) {
  const response = await fetch(`/api/crm/${encodeURIComponent(recordId)}`, {
    method: "DELETE"
  });
  await readJsonResponse<{ ok: true }>(response);
}

export async function fetchUniversityOpportunities() {
  const response = await fetch("/api/university-opportunities", {
    cache: "no-store"
  });
  const data = await readJsonResponse<{ opportunities: UniversityOpportunity[] }>(response);
  return data.opportunities;
}

export async function publishUniversityOpportunity(input: UniversityOpportunityInput) {
  const response = await fetch("/api/university-opportunities", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = await readJsonResponse<{ opportunity: UniversityOpportunity }>(response);
  return data.opportunity;
}
