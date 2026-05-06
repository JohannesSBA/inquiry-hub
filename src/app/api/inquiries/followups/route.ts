/**
 * POST /api/inquiries/followups — cron: send due follow-ups via Gmail.
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/server/config/env";
import { processDueFollowUps } from "@/server/followups/processDue";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed, failed, results } = await processDueFollowUps();
    return NextResponse.json({
      success: true,
      processed,
      failed,
      results,
    });
  } catch (error) {
    console.error("Follow-up processing failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
