import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

import { getDatabase } from "./db";

const SESSION_COOKIE_NAME = "innovare_session";
const SESSION_DURATION_DAYS = 30;

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || "dev-only-innovare-session-secret";
}

function signToken(token: string) {
  return createHash("sha256").update(`${token}:${getSessionSecret()}`).digest("hex");
}

function encodeCookieValue(token: string) {
  return `${token}.${signToken(token)}`;
}

function decodeCookieValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [token, signature] = value.split(".");
  if (!token || !signature || signToken(token) !== signature) {
    return null;
  }

  return token;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = decodeCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!token) {
    return null;
  }

  const sql = getDatabase();
  const rows = await sql`
    SELECT app_users.id, app_users.name, app_users.email
    FROM auth_sessions
    INNER JOIN app_users ON app_users.id = auth_sessions.user_id
    WHERE auth_sessions.token_hash = ${hashToken(token)}
      AND auth_sessions.expires_at > now()
    LIMIT 1
  `;

  const user = (rows as AuthenticatedUser[])[0];
  return user ?? null;
}

export async function createOrLoginUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password;

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("Please use a valid email.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const sql = getDatabase();
  const existingRows = await sql`SELECT id, name, email, password_hash FROM app_users WHERE email = ${email} LIMIT 1`;
  const existingUser = (existingRows as UserRow[])[0];

  if (existingUser) {
    const matches = await compare(password, existingUser.password_hash);
    if (!matches) {
      throw new Error("That email already exists. Use the original password.");
    }

    const rows = await sql`
      UPDATE app_users
      SET name = ${name}, updated_at = now()
      WHERE id = ${existingUser.id}
      RETURNING id, name, email
    `;

    return (rows as AuthenticatedUser[])[0];
  }

  const passwordHash = await hash(password, 12);
  const rows = await sql`
    INSERT INTO app_users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name, email
  `;

  return (rows as AuthenticatedUser[])[0];
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 86_400_000);
  const sql = getDatabase();

  await sql`
    INSERT INTO auth_sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${hashToken(token)}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeCookieValue(token), {
    httpOnly: true,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = decodeCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (token) {
    const sql = getDatabase();
    await sql`DELETE FROM auth_sessions WHERE token_hash = ${hashToken(token)}`;
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
