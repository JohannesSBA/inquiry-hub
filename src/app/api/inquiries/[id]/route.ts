/**
 * GET/PATCH /api/inquiries/[id]
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  serviceGetInquiry,
  servicePatchInquiry,
} from "@/server/inquiries/service";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const inquiry = await serviceGetInquiry(params.id);
    if (!inquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Failed to fetch inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const body = await request.json();
    const updated = await servicePatchInquiry(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
