/**
 * Poll Gmail for unread inbox messages and create Inquiry rows (deduped by Message-ID).
 */

import type { MailAccount } from "@prisma/client";
import { serviceCreateFromEmailParsed } from "@/server/inquiries/service";
import { getGmailClientForAccount } from "@/server/gmail/authClient";
import {
  extractPlainTextFromMessage,
  getHeader,
  parseFromHeader,
} from "@/server/gmail/messageParse";
import { repoMailAccountUpdate } from "@/server/gmail/repository";

export async function syncMailAccount(account: MailAccount): Promise<void> {
  const { gmail } = await getGmailClientForAccount(account);

  const profile = await gmail.users.getProfile({ userId: "me" });
  const latestHistoryId = profile.data.historyId ?? undefined;

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: 30,
    q: "is:unread in:inbox",
  });

  const messageIds = (list.data.messages ?? [])
    .map((m) => m.id)
    .filter((id): id is string => !!id);

  const seen = new Set<string>();
  for (const id of messageIds) {
    if (seen.has(id)) continue;
    seen.add(id);

    const full = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const headers = full.data.payload?.headers;
    const mid =
      getHeader(headers, "Message-ID") ||
      getHeader(headers, "Message-Id") ||
      null;
    if (!mid) continue;

    const fromRaw = getHeader(headers, "From");
    const parsed = parseFromHeader(fromRaw);
    if (!parsed) continue;

    const subject = getHeader(headers, "Subject") || "(no subject)";
    const body = extractPlainTextFromMessage(full.data.payload) || "";

    await serviceCreateFromEmailParsed({
      senderEmail: parsed.email,
      senderName: parsed.name,
      subject,
      body,
      externalMessageId: mid.trim(),
      gmailThreadId: full.data.threadId ?? null,
      inReplyToHeader:
        getHeader(headers, "In-Reply-To") ||
        getHeader(headers, "References") ||
        null,
    });

    try {
      await gmail.users.messages.modify({
        userId: "me",
        id,
        requestBody: { removeLabelIds: ["UNREAD"] },
      });
    } catch {
      /* non-fatal */
    }
  }

  if (latestHistoryId) {
    await repoMailAccountUpdate(account.id, {
      historyId: latestHistoryId,
      lastSyncedAt: new Date(),
      lastError: null,
    });
  }
}
