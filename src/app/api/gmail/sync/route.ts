/**
 * POST /api/gmail/sync — cron: poll all connected mailboxes (CRON_SECRET in prod).
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/server/config/env";
import { repoMailAccountListAll, repoMailAccountUpdate } from "@/server/gmail/repository";
import { syncMailAccount } from "@/server/gmail/ingest";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await repoMailAccountListAll();
  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const acc of accounts) {
    try {
      await syncMailAccount(acc);
      results.push({ id: acc.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "sync failed";
      await repoMailAccountUpdate(acc.id, { lastError: msg });
      results.push({ id: acc.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    success: true,
    synced: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
