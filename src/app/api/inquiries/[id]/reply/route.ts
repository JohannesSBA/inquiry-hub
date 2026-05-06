/**
 * POST /api/inquiries/[id]/reply — send draft via assignee Gmail.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendAssigneeReply } from "@/server/inquiries/reply";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";
import { serviceGetInquiry } from "@/server/inquiries/service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const inquiry = await serviceGetInquiry(params.id);
    const text =
      (typeof body.body === "string" && body.body) || inquiry?.aiDraft || "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Empty body — provide body or save aiDraft first" },
        { status: 400 },
      );
    }

    const result = await sendAssigneeReply({
      inquiryId: params.id,
      actingTeamMemberId: auth.teamMember.id,
      bodyText: text,
    });

    if (result.error === "not_found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (result.error === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (result.error === "no_mail") {
      return NextResponse.json(
        { error: "Connect Gmail first (Settings / Gmail)." },
        { status: 400 },
      );
    }

    const updated = await serviceGetInquiry(params.id);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("Reply send failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
