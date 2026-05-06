/**
 * Builds an authenticated Gmail API client from a MailAccount row.
 */

import { google } from "googleapis";
import type { MailAccount } from "@prisma/client";
import {
  decryptTokenBundle,
  encryptTokenBundle,
} from "@/server/gmail/tokensBundle";
import { createOAuth2Client } from "@/server/gmail/oauthClient";
import { repoMailAccountUpdate } from "@/server/gmail/repository";

export async function getGmailClientForAccount(account: MailAccount) {
  const oauth2 = createOAuth2Client();
  let bundle = decryptTokenBundle(account.tokensCipher, account.tokensIv);
  oauth2.setCredentials({
    access_token: bundle.accessToken,
    refresh_token: bundle.refreshToken,
  });

  oauth2.on("tokens", async (tokens) => {
    if (!tokens.access_token) return;
    bundle = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? bundle.refreshToken,
    };
    const enc = encryptTokenBundle(bundle);
    await repoMailAccountUpdate(account.id, {
      tokensCipher: enc.tokensCipher,
      tokensIv: enc.tokensIv,
    });
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2 });
  return { gmail, oauth2 };
}
