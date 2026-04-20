import { NextRequest, NextResponse } from "next/server";

import { jsonError, getErrorMessage } from "@/lib/server/api";
import { isDatabaseConfigured } from "@/lib/server/db";
import { createOrLoginUser, createSession, destroySession, getCurrentUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ configured: false, user: null });
  }

  try {
    const user = await getCurrentUser();
    return NextResponse.json({ configured: true, user });
  } catch (error) {
    return jsonError(getErrorMessage(error), 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return jsonError("Neon is not configured yet. Add DATABASE_URL to .env.local and run npm run db:migrate.", 503);
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const user = await createOrLoginUser({
      email: body.email ?? "",
      name: body.name ?? "",
      password: body.password ?? ""
    });

    await createSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return jsonError(getErrorMessage(error), 400);
  }
}

export async function DELETE() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(getErrorMessage(error), 500);
  }
}
