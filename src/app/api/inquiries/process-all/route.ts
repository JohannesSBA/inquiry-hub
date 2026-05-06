/**
 * POST /api/inquiries/process-all — batch classify NEW inquiries.
 */

import { NextResponse } from "next/server";
import { serviceProcessAllNew } from "@/server/inquiries/service";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";

export async function POST() {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const result = await serviceProcessAllNew();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Batch processing failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
