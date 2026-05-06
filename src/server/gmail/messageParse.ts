/**
 * Helpers to extract plain text and headers from Gmail API message payloads.
 */

import type { gmail_v1 } from "googleapis";

function decodeB64(data: string): string {
  const pad = data.length % 4 === 0 ? "" : "=".repeat(4 - (data.length % 4));
  return Buffer.from((data + pad).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8",
  );
}

export function extractPlainTextFromMessage(
  payload?: gmail_v1.Schema$MessagePart | null,
): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeB64(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const t = extractPlainTextFromMessage(part);
      if (t) return t;
    }
  }
  return "";
}

export function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  const h = headers.find((x) => x.name?.toLowerCase() === lower);
  return h?.value ?? undefined;
}

/** Parses `Name <email@x.com>` or bare email. */
export function parseFromHeader(from?: string): {
  email: string;
  name: string;
} | null {
  if (!from) return null;
  const m = from.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);
  if (m) {
    return { name: (m[1] || m[2]).trim(), email: m[2].trim() };
  }
  const email = from.trim();
  if (!email.includes("@")) return null;
  return { name: email.split("@")[0], email };
}
