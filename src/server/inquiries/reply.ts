/**
 * Sends an AI draft (or edited body) as the assignee’s connected Gmail account.
 */

import { repoFindById } from "@/server/inquiries/repository";
import { repoMailAccountByTeamMember } from "@/server/gmail/repository";
import { sendInquiryReplyEmail } from "@/server/gmail/send";

export async function sendAssigneeReply(params: {
  inquiryId: string;
  actingTeamMemberId: string;
  bodyText: string;
}) {
  const inquiry = await repoFindById(params.inquiryId);
  if (!inquiry) return { error: "not_found" as const };
  if (inquiry.assignedToId !== params.actingTeamMemberId) {
    return { error: "forbidden" as const };
  }
  const mail = await repoMailAccountByTeamMember(params.actingTeamMemberId);
  if (!mail) return { error: "no_mail" as const };

  await sendInquiryReplyEmail({
    mailAccount: mail,
    inquiry: {
      ...inquiry,
      contact: inquiry.contact,
      subject: inquiry.subject,
    },
    bodyText: params.bodyText,
  });

  return { success: true as const };
}
