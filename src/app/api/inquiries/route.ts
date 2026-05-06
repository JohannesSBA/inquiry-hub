/**
 * GET /api/inquiries — list + aggregate stats (authenticated).
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { serviceListInquiriesApi } from "@/server/inquiries/service";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";

export async function GET(request: NextRequest) {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const data = await serviceListInquiriesApi(
      new URL(request.url).searchParams,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to list inquiries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
