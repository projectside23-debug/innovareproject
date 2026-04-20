import { NextRequest, NextResponse } from "next/server";

import { jsonError, getErrorMessage } from "@/lib/server/api";
import { getDatabase, isDatabaseConfigured } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { normalizeCrmRecord } from "@/lib/utils";
import { CrmRecord } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireUser() {
  if (!isDatabaseConfigured()) {
    throw new Error("Neon is not configured yet. Add DATABASE_URL to .env.local and run npm run db:migrate.");
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Please sign in before using CRM.");
  }

  return user;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const record = normalizeCrmRecord((await request.json()) as CrmRecord);
    const sql = getDatabase();

    await sql`
      UPDATE crm_records
      SET data = ${JSON.stringify(record)}, status = ${record.status}, source_type = ${record.sourceType}, updated_at = now()
      WHERE user_id = ${user.id}
        AND id = ${id}
    `;

    return NextResponse.json({ record });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message, message.includes("sign in") ? 401 : 400);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const sql = getDatabase();

    await sql`
      DELETE FROM crm_records
      WHERE user_id = ${user.id}
        AND id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message, message.includes("sign in") ? 401 : 400);
  }
}
