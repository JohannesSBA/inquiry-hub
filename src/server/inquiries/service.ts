/**
 * Inquiry domain logic: inbound creation, listing filters, AI processing, patches.
 */

import type { Prisma } from "@prisma/client";
import type { InboundInquiry } from "@/types";
import { classifyInquiry } from "@/server/ai/classify";
import { emitInquiryEvent } from "@/server/realtime/broadcaster";
import {
  repoCancelPendingFollowUps,
  repoCount,
  repoCreateFollowUp,
  repoCreateInquiry,
  repoFindByExternalMessageId,
  repoFindById,
  repoFindByIdWithContact,
  repoFindUnprocessedNew,
  repoGroupByPriority,
  repoGroupByStatus,
  repoListForApi,
  repoTeamMemberFindFirstByRole,
  repoUpdateInquiry,
  repoUpsertContact,
} from "@/server/inquiries/repository";

export async function serviceListInquiriesApi(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const channel = searchParams.get("channel");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const where: Prisma.InquiryWhereInput = {};
  if (status) where.status = status as Prisma.InquiryWhereInput["status"];
  if (category) where.category = category as Prisma.InquiryWhereInput["category"];
  if (priority) where.priority = priority as Prisma.InquiryWhereInput["priority"];
  if (channel) where.channel = channel as Prisma.InquiryWhereInput["channel"];
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { contact: { name: { contains: search, mode: "insensitive" } } },
      { contact: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [inquiries, total] = await Promise.all([
    repoListForApi({ where, skip: (page - 1) * limit, take: limit }),
    repoCount(where),
  ]);

  const [stats, priorityStats] = await Promise.all([
    repoGroupByStatus(),
    repoGroupByPriority(),
  ]);

  return {
    inquiries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    stats: {
      byStatus: Object.fromEntries(stats.map((s) => [s.status, s._count])),
      byPriority: Object.fromEntries(
        priorityStats.map((s) => [s.priority, s._count]),
      ),
      total,
    },
  };
}

export async function serviceGetInquiry(id: string) {
  return repoFindById(id);
}

export async function servicePatchInquiry(
  id: string,
  body: Record<string, unknown>,
) {
  const allowedFields = [
    "status",
    "category",
    "priority",
    "assignedToId",
    "aiDraft",
  ];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  if (data.status === "REPLIED" || data.status === "CLOSED") {
    await repoCancelPendingFollowUps(id);
  }

  const patch = { ...data } as Prisma.InquiryUpdateInput;
  if (data.status === "REPLIED") {
    patch.repliedAt = new Date();
  }

  const updated = await repoUpdateInquiry(id, patch);
  emitInquiryEvent({ type: "inquiry.updated", inquiryId: id });
  return updated;
}

export async function serviceCreateInbound(body: InboundInquiry) {
  const contact = await repoUpsertContact({
    senderEmail: body.senderEmail,
    senderName: body.senderName,
    company: body.company,
    phone: body.phone,
    channel: body.channel,
  });

  const inquiry = await repoCreateInquiry({
    subject: body.subject,
    body: body.body,
    channel: body.channel,
    contact: { connect: { id: contact.id } },
    receivedAt: new Date(),
  });

  emitInquiryEvent({ type: "inquiry.created", inquiryId: inquiry.id });
  return { inquiry, contact };
}

export async function serviceCreateFromEmailParsed(args: {
  senderEmail: string;
  senderName: string;
  subject: string;
  body: string;
  externalMessageId: string;
  gmailThreadId?: string | null;
  inReplyToHeader?: string | null;
}) {
  const existing = await repoFindByExternalMessageId(args.externalMessageId);
  if (existing) return { skipped: true as const, inquiryId: existing.id };

  const contact = await repoUpsertContact({
    senderEmail: args.senderEmail,
    senderName: args.senderName,
    channel: "EMAIL",
  });

  const inquiry = await repoCreateInquiry({
    subject: args.subject,
    body: args.body,
    channel: "EMAIL",
    externalMessageId: args.externalMessageId,
    gmailThreadId: args.gmailThreadId ?? undefined,
    inReplyToHeader: args.inReplyToHeader ?? undefined,
    contact: { connect: { id: contact.id } },
    receivedAt: new Date(),
  });

  emitInquiryEvent({ type: "inquiry.created", inquiryId: inquiry.id });
  return { skipped: false as const, inquiry };
}

export async function serviceProcessInquiry(inquiryId: string) {
  const inquiry = await repoFindByIdWithContact(inquiryId);
  if (!inquiry) return { error: "not_found" as const };
  if (inquiry.category) {
    const full = await repoFindById(inquiryId);
    return {
      success: true as const,
      message: "Already processed",
      inquiry: full!,
    };
  }

  const classification = await classifyInquiry(
    inquiry.subject,
    inquiry.body,
    inquiry.channel,
    inquiry.contact.name,
  );

  const teamMember = await repoTeamMemberFindFirstByRole(
    classification.suggestedAssignment,
  );

  const updated = await repoUpdateInquiry(inquiryId, {
    category: classification.category.toUpperCase() as Prisma.InquiryUpdateInput["category"],
    priority: classification.priority.toUpperCase() as Prisma.InquiryUpdateInput["priority"],
    intent: classification.intent,
    sentiment: classification.sentiment.toUpperCase() as Prisma.InquiryUpdateInput["sentiment"],
    aiDraft: classification.draftReply,
    status: "PROCESSING",
    processedAt: new Date(),
    assignedToId: teamMember?.id ?? null,
  });

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + classification.followUpDays);

  await repoCreateFollowUp({
    inquiry: { connect: { id: inquiryId } },
    message: "",
    scheduledAt: followUpDate,
    attempt: 1,
  });

  emitInquiryEvent({ type: "inquiry.classified", inquiryId });
  return { success: true as const, inquiry: updated, classification };
}

export async function serviceProcessAllNew() {
  const unprocessed = await repoFindUnprocessedNew();
  if (unprocessed.length === 0) {
    return {
      success: true as const,
      message: "No unprocessed inquiries",
      processed: 0,
      failed: 0,
      results: [] as { id: string; status: string; category?: string }[],
    };
  }

  const results: { id: string; status: string; category?: string }[] = [];

  for (const inquiry of unprocessed) {
    try {
      const classification = await classifyInquiry(
        inquiry.subject,
        inquiry.body,
        inquiry.channel,
        inquiry.contact.name,
      );

      const teamMember = await repoTeamMemberFindFirstByRole(
        classification.suggestedAssignment,
      );

      await repoUpdateInquiry(inquiry.id, {
        category: classification.category.toUpperCase() as Prisma.InquiryUpdateInput["category"],
        priority: classification.priority.toUpperCase() as Prisma.InquiryUpdateInput["priority"],
        intent: classification.intent,
        sentiment: classification.sentiment.toUpperCase() as Prisma.InquiryUpdateInput["sentiment"],
        aiDraft: classification.draftReply,
        status: "PROCESSING",
        processedAt: new Date(),
        assignedToId: teamMember?.id ?? null,
      });

      const followUpDate = new Date();
      followUpDate.setDate(
        followUpDate.getDate() + classification.followUpDays,
      );

      await repoCreateFollowUp({
        inquiry: { connect: { id: inquiry.id } },
        message: "",
        scheduledAt: followUpDate,
        attempt: 1,
      });

      emitInquiryEvent({ type: "inquiry.classified", inquiryId: inquiry.id });
      results.push({
        id: inquiry.id,
        status: "processed",
        category: classification.category,
      });
    } catch (err) {
      console.error(`Failed to process inquiry ${inquiry.id}:`, err);
      results.push({ id: inquiry.id, status: "failed" });
    }
  }

  return {
    success: true as const,
    processed: results.filter((r) => r.status === "processed").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };
}
