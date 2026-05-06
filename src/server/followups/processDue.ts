/**
 * Cron job logic: generate follow-up copy, send via Gmail, reschedule attempts.
 */

import { generateFollowUp } from "@/server/ai/followup";
import { prisma } from "@/lib/prisma";
import { sendFollowUpEmail } from "@/server/gmail/send";
import { repoMailAccountByTeamMember } from "@/server/gmail/repository";
import {
  repoCreateFollowUp,
  repoFollowUpUpdate,
  repoUpdateInquiry,
} from "@/server/inquiries/repository";
import { emitInquiryEvent } from "@/server/realtime/broadcaster";

export async function processDueFollowUps(): Promise<{
  processed: number;
  failed: number;
  results: unknown[];
}> {
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
    include: {
      inquiry: {
        include: { contact: true },
      },
    },
    take: 50,
  });

  if (dueFollowUps.length === 0) {
    return { processed: 0, failed: 0, results: [] };
  }

  const results: unknown[] = [];

  for (const followUp of dueFollowUps) {
    try {
      const inquiry = followUp.inquiry;
      if (!inquiry.assignedToId) {
        await repoFollowUpUpdate(followUp.id, {
          status: "FAILED",
          lastError: "No assignee — cannot send from a mailbox",
        });
        results.push({ id: followUp.id, status: "failed" });
        continue;
      }

      const mailAccount = await repoMailAccountByTeamMember(
        inquiry.assignedToId,
      );
      if (!mailAccount) {
        await repoFollowUpUpdate(followUp.id, {
          status: "FAILED",
          lastError: "Assignee has not connected Gmail",
        });
        results.push({ id: followUp.id, status: "failed" });
        continue;
      }

      const message = await generateFollowUp(
        inquiry.body,
        inquiry.category || "GENERAL",
        followUp.attempt,
      );

      await sendFollowUpEmail({
        mailAccount,
        inquiry,
        bodyText: message,
      });

      await repoFollowUpUpdate(followUp.id, {
        message,
        status: "SENT",
        sentAt: new Date(),
        lastError: null,
      });

      await repoUpdateInquiry(inquiry.id, { status: "FOLLOW_UP" });

      if (followUp.attempt < 3) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (followUp.attempt + 1) * 2);
        await repoCreateFollowUp({
          inquiry: { connect: { id: followUp.inquiryId } },
          message: "",
          scheduledAt: nextDate,
          attempt: followUp.attempt + 1,
        });
      }

      emitInquiryEvent({
        type: "followup.sent",
        followUpId: followUp.id,
        inquiryId: inquiry.id,
      });

      results.push({
        id: followUp.id,
        inquiryId: followUp.inquiryId,
        contact: inquiry.contact.email,
        status: "sent",
        attempt: followUp.attempt,
      });
    } catch (err) {
      console.error(`Failed to process follow-up ${followUp.id}:`, err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      await repoFollowUpUpdate(followUp.id, {
        status: "FAILED",
        lastError: msg,
      });
      results.push({ id: followUp.id, status: "failed" });
    }
  }

  return {
    processed: results.filter((r: any) => r.status === "sent").length,
    failed: results.filter((r: any) => r.status === "failed").length,
    results,
  };
}
