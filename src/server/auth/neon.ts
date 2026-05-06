/**
 * Neon Auth server singleton — proxies to managed Better Auth at AUTH_URL.
 */

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { env } from "@/server/config/env";

export const neonAuth = createNeonAuth({
  baseUrl: env.AUTH_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
});
