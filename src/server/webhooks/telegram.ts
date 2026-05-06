/**
 * Telegram Bot API update → InboundInquiry (requires secret header match).
 */

import { env } from "@/server/config/env";

export function verifyTelegramSecret(headers: Headers): boolean {
  const secret = env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  const token = headers.get("x-telegram-bot-api-secret-token");
  return token === secret;
}

export function telegramToInbound(payload: unknown): {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
} | null {
  const p = payload as {
    message?: {
      text?: string;
      chat?: { id?: number; username?: string; first_name?: string };
    };
  };
  const text = p.message?.text;
  const chat = p.message?.chat;
  if (!text || chat?.id == null) return null;
  const name =
    chat.first_name ||
    chat.username ||
    `telegram_${chat.id}`;
  const pseudoEmail = `telegram_${chat.id}@channels.local`;
  return {
    senderName: name,
    senderEmail: pseudoEmail,
    subject: `Telegram message from ${name}`,
    body: text,
  };
}
