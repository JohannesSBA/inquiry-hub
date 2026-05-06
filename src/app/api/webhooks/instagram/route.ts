/**
 * Instagram messaging webhooks (Meta) — same HMAC verification as WhatsApp.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { dispatchInbound } from "@/server/webhooks/service";
import {
  instagramToInbound,
  verifyInstagramSignature,
} from "@/server/webhooks/instagram";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256");
  if (!verifyInstagramSignature(raw, sig)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(raw) as unknown;
    const parsed = instagramToInbound(payload);
    if (!parsed) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await dispatchInbound({ ...parsed, channel: "SOCIAL" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
