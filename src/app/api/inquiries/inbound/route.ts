/**
 * POST /api/inquiries/inbound — public ingestion for forms + adapters.
 */

import { NextRequest, NextResponse } from "next/server";
import type { InboundInquiry } from "@/types";
import { serviceCreateInbound } from "@/server/inquiries/service";

export async function POST(request: NextRequest) {
  try {
    const body: InboundInquiry = await request.json();

    if (!body.senderEmail || !body.subject || !body.body || !body.channel) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: senderEmail, subject, body, channel",
        },
        { status: 400 },
      );
    }

    const { inquiry, contact } = await serviceCreateInbound(body);

    return NextResponse.json(
      {
        success: true,
        inquiry: {
          id: inquiry.id,
          subject: inquiry.subject,
          status: inquiry.status,
          contact: { id: contact.id, name: contact.name, email: contact.email },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
