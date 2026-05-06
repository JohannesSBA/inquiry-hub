/**
 * Signed OAuth state payload so Gmail callback cannot be forged.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/config/env";

const TTL_MS = 15 * 60 * 1000;

function secret(): string {
  return env.NEON_AUTH_COOKIE_SECRET;
}

export function signOAuthState(teamMemberId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${teamMemberId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ teamMemberId, exp, sig }), "utf8").toString(
    "base64url",
  );
}

export function verifyOAuthState(state: string): { teamMemberId: string } | null {
  try {
    const raw = Buffer.from(state, "base64url").toString("utf8");
    const { teamMemberId, exp, sig } = JSON.parse(raw) as {
      teamMemberId: string;
      exp: number;
      sig: string;
    };
    if (typeof teamMemberId !== "string" || typeof exp !== "number") return null;
    if (Date.now() > exp) return null;
    const payload = `${teamMemberId}.${exp}`;
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { teamMemberId };
  } catch {
    return null;
  }
}
