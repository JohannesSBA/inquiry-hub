/**
 * GET /api/gmail/connect — starts OAuth flow for the signed-in team member.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createOAuth2Client, GMAIL_SCOPES } from "@/server/gmail/oauthClient";
import { signOAuthState } from "@/server/gmail/oauthState";
import {
  jsonUnauthorized,
  requireTeamMemberApi,
} from "@/server/auth/apiGuard";

export async function GET() {
  const auth = await requireTeamMemberApi();
  if (!auth) return jsonUnauthorized();

  try {
    const oauth2 = createOAuth2Client();
    const state = signOAuthState(auth.teamMember.id);
    const url = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SCOPES,
      state,
    });
    return NextResponse.redirect(url);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gmail OAuth not configured" },
      { status: 500 },
    );
  }
}
