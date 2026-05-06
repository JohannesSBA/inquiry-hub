/**
 * WhatsApp Cloud API webhooks — GET verify, POST inbound messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { dispatchInbound } from "@/server/webhooks/service";
import {
  verifyWhatsAppGet,
  verifyWhatsAppSignature,
  whatsappToInbound,
} from "@/server/webhooks/whatsapp";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (verifyWhatsAppGet(mode, token) && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256");
  if (!verifyWhatsAppSignature(raw, sig)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(raw) as unknown;
    const parsed = whatsappToInbound(payload);
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
