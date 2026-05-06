/**
 * GET /api/gmail/callback — OAuth redirect target; stores encrypted tokens.
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createOAuth2Client } from "@/server/gmail/oauthClient";
import { verifyOAuthState } from "@/server/gmail/oauthState";
import { encryptTokenBundle } from "@/server/gmail/tokensBundle";
import { repoMailAccountUpsertTokens } from "@/server/gmail/repository";
import { env } from "@/server/config/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  if (err || !code || !state) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?gmail=error`,
    );
  }

  const verified = verifyOAuthState(state);
  if (!verified) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?gmail=bad_state`,
    );
  }

  try {
    const oauth2 = createOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Missing tokens");
    }

    oauth2.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2 });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const emailAddr = profile.data.emailAddress;
    if (!emailAddr) throw new Error("No Gmail profile email");

    const enc = encryptTokenBundle({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    await repoMailAccountUpsertTokens({
      teamMemberId: verified.teamMemberId,
      email: emailAddr,
      tokensCipher: enc.tokensCipher,
      tokensIv: enc.tokensIv,
      scope: tokens.scope ?? null,
    });

    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?gmail=connected`,
    );
  } catch (e) {
    console.error("Gmail callback failed:", e);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?gmail=callback_error`,
    );
  }
}
