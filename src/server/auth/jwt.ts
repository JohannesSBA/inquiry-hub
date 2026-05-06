/**
 * Optional bearer JWT verification using Neon Auth JWKS (stateless checks).
 */

import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/server/config/env";

const jwks = createRemoteJWKSet(new URL(env.JWKS_URL));

export async function verifyAuthJwt(token: string) {
  /** Issuer claim varies by Neon Auth deployment; rely on JWKS signature only. */
  const { payload } = await jwtVerify(token, jwks);
  return payload;
}
