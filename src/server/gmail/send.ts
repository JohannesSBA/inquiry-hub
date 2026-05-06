/**
 * Send outbound Gmail messages (replies and follow-ups).
 */

import type { Inquiry, MailAccount } from "@prisma/client";
import { getGmailClientForAccount } from "@/server/gmail/authClient";
import {
  repoCancelPendingFollowUps,
  repoUpdateInquiry,
} from "@/server/inquiries/repository";
import { emitInquiryEvent } from "@/server/realtime/broadcaster";

async function patchInquiryReplied(inquiryId: string) {
  await repoCancelPendingFollowUps(inquiryId);
  await repoUpdateInquiry(inquiryId, {
    status: "REPLIED",
    repliedAt: new Date(),
  });
  emitInquiryEvent({ type: "inquiry.updated", inquiryId });
}

export async function sendInquiryReplyEmail(args: {
  mailAccount: MailAccount;
  inquiry: Inquiry & {
    contact: { email: string };
    subject: string;
  };
  bodyText: string;
}): Promise<void> {
  const { gmail } = await getGmailClientForAccount(args.mailAccount);
  const subj = args.inquiry.subject.startsWith("Re:")
    ? args.inquiry.subject
    : `Re: ${args.inquiry.subject}`;
  const lines = [
    `To: ${args.inquiry.contact.email}`,
    `Subject: ${subj}`,
  ];
  if (args.inquiry.inReplyToHeader) {
    lines.push(`In-Reply-To: ${args.inquiry.inReplyToHeader}`);
    lines.push(`References: ${args.inquiry.inReplyToHeader}`);
  }
  lines.push("MIME-Version: 1.0");
  lines.push("Content-Type: text/plain; charset=UTF-8");
  lines.push("");
  lines.push(args.bodyText);

  const raw = Buffer.from(lines.join("\r\n")).toString("base64url");
  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: args.inquiry.gmailThreadId ?? undefined,
    },
  });

  await patchInquiryReplied(args.inquiry.id);
}

export async function sendFollowUpEmail(args: {
  mailAccount: MailAccount;
  inquiry: Inquiry & { contact: { email: string }; subject: string };
  bodyText: string;
}): Promise<void> {
  const { gmail } = await getGmailClientForAccount(args.mailAccount);
  const subj = args.inquiry.subject.startsWith("Re:")
    ? args.inquiry.subject
    : `Re: ${args.inquiry.subject}`;
  const lines = [
    `To: ${args.inquiry.contact.email}`,
    `Subject: ${subj}`,
  ];
  if (args.inquiry.inReplyToHeader) {
    lines.push(`In-Reply-To: ${args.inquiry.inReplyToHeader}`);
    lines.push(`References: ${args.inquiry.inReplyToHeader}`);
  }
  lines.push("MIME-Version: 1.0");
  lines.push("Content-Type: text/plain; charset=UTF-8");
  lines.push("");
  lines.push(args.bodyText);

  const raw = Buffer.from(lines.join("\r\n")).toString("base64url");
  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: args.inquiry.gmailThreadId ?? undefined,
    },
  });
}
