/**
 * AES-256-GCM encrypt/decrypt for OAuth tokens at rest (MailAccount rows).
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { env } from "@/server/config/env";

const IV_LEN = 16;
const KEY_LEN = 32;

function encryptionKey(): Buffer {
  const raw = env.MAIL_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("MAIL_TOKEN_ENCRYPTION_KEY is not set");
  }
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length === KEY_LEN) return decoded;
  return scryptSync(raw, "inquiry-hub-mail", KEY_LEN);
}

export function encryptSecret(plain: string): { cipher: string; iv: string } {
  const iv = randomBytes(IV_LEN);
  const key = encryptionKey();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return {
    cipher: enc.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(cipherB64: string, ivB64: string): string {
  const key = encryptionKey();
  const iv = Buffer.from(ivB64, "base64");
  const buf = Buffer.from(cipherB64, "base64");
  const authTag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
