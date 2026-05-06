/**
 * Serialize Gmail OAuth tokens into one encrypted payload (single IV).
 */

import { decryptSecret, encryptSecret } from "@/server/gmail/tokenCrypto";

export type TokenBundle = { accessToken: string; refreshToken: string };

export function encryptTokenBundle(bundle: TokenBundle): {
  tokensCipher: string;
  tokensIv: string;
} {
  const { cipher, iv } = encryptSecret(JSON.stringify(bundle));
  return { tokensCipher: cipher, tokensIv: iv };
}

export function decryptTokenBundle(
  tokensCipher: string,
  tokensIv: string,
): TokenBundle {
  const raw = decryptSecret(tokensCipher, tokensIv);
  return JSON.parse(raw) as TokenBundle;
}
