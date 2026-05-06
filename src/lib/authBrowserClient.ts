/**
 * Browser-side Neon Auth client — targets same-origin `/api/auth` proxy.
 */

"use client";

import { createAuthClient, BetterAuthVanillaAdapter } from "@neondatabase/auth";

let cached: ReturnType<typeof createAuthClient> | null = null;

export function getAuthBrowserClient() {
  if (cached) return cached;
  const base = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
  cached = createAuthClient(`${base}/api/auth`, {
    adapter: BetterAuthVanillaAdapter(),
  });
  return cached;
}
