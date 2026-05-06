/**
 * Browser-side Neon Auth client — targets same-origin `/api/auth` proxy.
 */

"use client";

import { createAuthClient, type VanillaBetterAuthClient } from "@neondatabase/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/auth/vanilla/adapters";

let cached: VanillaBetterAuthClient | null = null;

export function getAuthBrowserClient(): VanillaBetterAuthClient {
  if (cached) return cached;
  const base = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
  cached = createAuthClient(`${base}/api/auth`, {
    adapter: BetterAuthVanillaAdapter(),
  }) as VanillaBetterAuthClient;
  return cached;
}
