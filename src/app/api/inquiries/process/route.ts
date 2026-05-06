/**
 * POST /api/inquiries/process — classify single inquiry.
 */

import { NextRequest, NextResponse } from "next/server";
import { serviceProcessInquiry } from "@/server/inquiries/service";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";

export async function POST(request: NextRequest) {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const { inquiryId } = await request.json();
    if (!inquiryId) {
      return NextResponse.json({ error: "Missing inquiryId" }, { status: 400 });
    }

    const result = await serviceProcessInquiry(inquiryId);
    if (result.error === "not_found") {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to process inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
