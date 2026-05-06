/**
 * Single source of truth for validated environment variables.
 * Import `env` from here instead of reading process.env ad hoc.
 *
 * Note: no `dotenv/config` here — Next.js loads `.env*`; keeps middleware Edge-safe.
 */

import { z } from "zod";

/** Neon Auth cookie signing — must be 32+ random chars in real deployments. */
function resolveNeonAuthCookieSecret(): string {
  const raw = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  if (raw && raw.length >= 32) return raw;
  console.warn(
    "[env] NEON_AUTH_COOKIE_SECRET missing or too short — using insecure fallback. Generate: openssl rand -base64 32",
  );
  return "development-only-neon-auth-cookie-secret-32ch!";
}

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  /** Neon Auth service base URL (from Neon dashboard). */
  AUTH_URL: z.string().url(),
  /** JWKS endpoint for optional JWT verification (e.g. bearer tokens). */
  JWKS_URL: z.string().url(),
  /** Same as AUTH_URL; exposed to the browser for the auth client via app proxy. */
  NEXT_PUBLIC_APP_URL: z.string().url(),
  /** Minimum 32 chars — session cookie signing for Neon Auth middleware. */
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  /** Comma-separated email domains allowed to use the app (empty = allow all). */
  AUTH_ALLOWED_EMAIL_DOMAINS: z.string().optional(),
  CRON_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  MEDA_SKIP_MIGRATION_WARNING: z.string().optional(),
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REDIRECT_URI: z.string().url().optional(),
  /** Base64-encoded 32-byte key for AES-256-GCM token encryption at rest. */
  MAIL_TOKEN_ENCRYPTION_KEY: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

function parseEnv(): Env {
  const parsed = schema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AUTH_URL: process.env.AUTH_URL,
    JWKS_URL: process.env.JWKS_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEON_AUTH_COOKIE_SECRET: resolveNeonAuthCookieSecret(),
    AUTH_ALLOWED_EMAIL_DOMAINS: process.env.AUTH_ALLOWED_EMAIL_DOMAINS,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
    MEDA_SKIP_MIGRATION_WARNING: process.env.MEDA_SKIP_MIGRATION_WARNING,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI,
    MAIL_TOKEN_ENCRYPTION_KEY: process.env.MAIL_TOKEN_ENCRYPTION_KEY,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    META_APP_SECRET: process.env.META_APP_SECRET,
  });

  if (!parsed.success) {
    console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const env = parseEnv();

/** App origin + proxied Neon Auth API path (same-origin cookies). */
export function getPublicAuthApiBaseUrl(): string {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/auth`;
}
