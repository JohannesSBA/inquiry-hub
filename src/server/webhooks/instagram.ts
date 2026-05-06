/**
 * Meta Instagram messaging webhook — same signature scheme as WhatsApp Graph API.
 */

import { verifyWhatsAppSignature } from "@/server/webhooks/whatsapp";

export const verifyInstagramSignature = verifyWhatsAppSignature;

export function instagramToInbound(payload: unknown): {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
} | null {
  const p = payload as {
    entry?: Array<{
      messaging?: Array<{
        sender?: { id?: string };
        message?: { text?: string };
      }>;
    }>;
  };
  const ev = p.entry?.[0]?.messaging?.[0];
  const id = ev?.sender?.id;
  const text = ev?.message?.text;
  if (!id || !text) return null;
  const pseudoEmail = `instagram_${id}@channels.local`;
  return {
    senderName: `instagram_${id}`,
    senderEmail: pseudoEmail,
    subject: `Instagram DM`,
    body: text,
  };
}
