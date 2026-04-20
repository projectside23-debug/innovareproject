import { NextRequest, NextResponse } from "next/server";

import { jsonError, getErrorMessage } from "@/lib/server/api";
import { getDatabase, isDatabaseConfigured } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return jsonError("Neon is not configured yet. Add DATABASE_URL to .env.local and run npm run db:migrate.", 503);
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const message = body.message?.trim() ?? "";

    if (!name) {
      return jsonError("Name is required.");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonError("Please use a valid email.");
    }

    if (!message) {
      return jsonError("Please add a short message.");
    }

    const sql = getDatabase();
    const user = await getCurrentUser().catch(() => null);
    await sql`
      INSERT INTO contact_messages (user_id, name, email, message)
      VALUES (${user?.id ?? null}, ${name}, ${email}, ${message})
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(getErrorMessage(error), 500);
  }
}
