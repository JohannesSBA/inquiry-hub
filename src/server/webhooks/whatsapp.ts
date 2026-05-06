/**
 * Meta WhatsApp Cloud API webhook verification + inbound normalization.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/config/env";

export function verifyWhatsAppGet(mode: string | null, token: string | null) {
  const expected = env.WHATSAPP_VERIFY_TOKEN;
  if (!expected || mode !== "subscribe" || !token) return false;
  return token === expected;
}

export function verifyWhatsAppSignature(rawBody: string, sigHeader: string | null) {
  const secret = env.META_APP_SECRET;
  if (!secret || !sigHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const got = sigHeader.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(got, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function whatsappToInbound(payload: unknown): {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
} | null {
  const p = payload as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            type?: string;
            text?: { body?: string };
            from?: string;
          }>;
          contacts?: Array<{ profile?: { name?: string } }>;
        };
      }>;
    }>;
  };
  const msg = p.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== "text" || !msg.text?.body || !msg.from) return null;
  const name =
    p.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ||
    msg.from;
  const pseudoEmail = `whatsapp_${msg.from}@channels.local`;
  return {
    senderName: name,
    senderEmail: pseudoEmail,
    subject: `WhatsApp from ${name}`,
    body: msg.text.body,
  };
}
