import { NextRequest, NextResponse } from "next/server";

import { jsonError, getErrorMessage } from "@/lib/server/api";
import { getDatabase, isDatabaseConfigured } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { createUniversityOpportunityFromInput } from "@/lib/utils";
import { UniversityOpportunity, UniversityOpportunityInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return jsonError("Neon is not configured yet. Add DATABASE_URL to .env.local and run npm run db:migrate.", 503);
  }

  try {
    const sql = getDatabase();
    const rows = await sql`
      SELECT data
      FROM university_opportunities
      ORDER BY updated_at DESC, created_at DESC
    `;

    const opportunities = (rows as Array<{ data: UniversityOpportunity }>).map((row) => ({
      ...row.data,
      isUserAdded: true
    }));

    return NextResponse.json({ opportunities });
  } catch (error) {
    return jsonError(getErrorMessage(error), 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return jsonError("Neon is not configured yet. Add DATABASE_URL to .env.local and run npm run db:migrate.", 503);
  }

  try {
    const input = (await request.json()) as UniversityOpportunityInput;
    const opportunity = createUniversityOpportunityFromInput(input);
    const user = await getCurrentUser().catch(() => null);
    const sql = getDatabase();

    await sql`
      INSERT INTO university_opportunities (id, user_id, ecosystem_id, data, updated_at)
      VALUES (
        ${opportunity.id},
        ${user?.id ?? null},
        ${opportunity.ecosystemId},
        ${JSON.stringify(opportunity)},
        now()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        user_id = excluded.user_id,
        ecosystem_id = excluded.ecosystem_id,
        data = excluded.data,
        updated_at = now()
    `;

    return NextResponse.json({ opportunity });
  } catch (error) {
    return jsonError(getErrorMessage(error), 400);
  }
}
