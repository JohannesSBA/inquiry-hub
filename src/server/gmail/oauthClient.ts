/**
 * Google OAuth2 client factory for Gmail scopes.
 */

import { google } from "googleapis";
import { env } from "@/server/config/env";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

export function createOAuth2Client() {
  const id = env.GMAIL_CLIENT_ID;
  const secret = env.GMAIL_CLIENT_SECRET;
  const redirect = env.GMAIL_REDIRECT_URI;
  if (!id || !secret || !redirect) {
    throw new Error(
      "Gmail OAuth is not configured (GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REDIRECT_URI)",
    );
  }
  return new google.auth.OAuth2(id, secret, redirect);
}
