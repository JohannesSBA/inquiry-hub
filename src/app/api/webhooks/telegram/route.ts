/**
 * POST /api/webhooks/telegram — Telegram Bot updates (secret header).
 */

import { NextRequest, NextResponse } from "next/server";
import { dispatchInbound } from "@/server/webhooks/service";
import {
  telegramToInbound,
  verifyTelegramSecret,
} from "@/server/webhooks/telegram";

export async function POST(request: NextRequest) {
  if (!verifyTelegramSecret(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = telegramToInbound(payload);
    if (!parsed) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await dispatchInbound({
      ...parsed,
      channel: "SOCIAL",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
