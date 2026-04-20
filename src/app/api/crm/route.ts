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

export async function GET() {
  try {
    const user = await requireUser();
    const sql = getDatabase();
    const rows = await sql`
      SELECT data
      FROM crm_records
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `;

    const records = (rows as Array<{ data: CrmRecord }>).map((row) => normalizeCrmRecord(row.data));
    return NextResponse.json({ records });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message, message.includes("sign in") ? 401 : 503);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const record = normalizeCrmRecord((await request.json()) as CrmRecord);
    const sql = getDatabase();

    await sql`
      INSERT INTO crm_records (id, user_id, data, status, source_type, updated_at)
      VALUES (${record.id}, ${user.id}, ${JSON.stringify(record)}, ${record.status}, ${record.sourceType}, now())
      ON CONFLICT (user_id, id)
      DO UPDATE SET
        data = excluded.data,
        status = excluded.status,
        source_type = excluded.source_type,
        updated_at = now()
    `;

    return NextResponse.json({ record });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message, message.includes("sign in") ? 401 : 400);
  }
}
