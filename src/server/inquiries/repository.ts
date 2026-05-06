/**
 * Database-only Prisma operations for inquiries — no business rules.
 */

import type { Channel, Prisma, TeamRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dashboardInquiryInclude = {
  contact: true,
  assignedTo: true,
  followUps: {
    orderBy: { scheduledAt: "desc" as const },
    take: 3,
  },
} satisfies Prisma.InquiryInclude;

export const fullInquiryInclude = {
  contact: true,
  assignedTo: true,
  followUps: { orderBy: { scheduledAt: "desc" as const } },
} satisfies Prisma.InquiryInclude;

export type DashboardInquiry = Prisma.InquiryGetPayload<{
  include: typeof dashboardInquiryInclude;
}>;

export async function repoListDashboardTake(
  take: number,
): Promise<DashboardInquiry[]> {
  return prisma.inquiry.findMany({
    include: dashboardInquiryInclude,
    orderBy: [{ receivedAt: "desc" }],
    take,
  });
}

export async function repoListForApi(params: {
  where: Prisma.InquiryWhereInput;
  skip: number;
  take: number;
}) {
  return prisma.inquiry.findMany({
    where: params.where,
    include: {
      contact: true,
      assignedTo: true,
      followUps: {
        where: { status: "PENDING" },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
    },
    orderBy: [{ priority: "asc" }, { receivedAt: "desc" }],
    skip: params.skip,
    take: params.take,
  });
}

export async function repoCount(where: Prisma.InquiryWhereInput) {
  return prisma.inquiry.count({ where });
}

export async function repoGroupByStatus() {
  return prisma.inquiry.groupBy({ by: ["status"], _count: true });
}

export async function repoGroupByPriority() {
  return prisma.inquiry.groupBy({
    by: ["priority"],
    _count: true,
    where: { priority: { not: null } },
  });
}

export async function repoFindById(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: fullInquiryInclude,
  });
}

export async function repoFindByIdWithContact(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: { contact: true },
  });
}

export async function repoFindUnprocessedNew() {
  return prisma.inquiry.findMany({
    where: { category: null, status: "NEW" },
    include: { contact: true },
    orderBy: { receivedAt: "asc" },
  });
}

export async function repoCancelPendingFollowUps(inquiryId: string) {
  return prisma.followUp.updateMany({
    where: { inquiryId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

export async function repoUpdateInquiry(
  id: string,
  data: Prisma.InquiryUpdateInput,
) {
  return prisma.inquiry.update({
    where: { id },
    data,
    include: fullInquiryInclude,
  });
}

export async function repoUpsertContact(inbound: {
  senderEmail: string;
  senderName?: string;
  company?: string;
  phone?: string;
  channel: Channel;
}) {
  return prisma.contact.upsert({
    where: { email: inbound.senderEmail },
    update: {
      name: inbound.senderName || undefined,
      company: inbound.company || undefined,
      phone: inbound.phone || undefined,
    },
    create: {
      name: inbound.senderName || inbound.senderEmail.split("@")[0],
      email: inbound.senderEmail,
      company: inbound.company,
      phone: inbound.phone,
      channel: inbound.channel,
    },
  });
}

export async function repoCreateInquiry(data: Prisma.InquiryCreateInput) {
  return prisma.inquiry.create({
    data,
    include: { contact: true },
  });
}

export async function repoCreateFollowUp(data: Prisma.FollowUpCreateInput) {
  return prisma.followUp.create({ data });
}

export async function repoFollowUpUpdate(
  id: string,
  data: Prisma.FollowUpUpdateInput,
) {
  return prisma.followUp.update({ where: { id }, data });
}

export async function repoTeamMemberFindFirstByRole(role: string) {
  return prisma.teamMember.findFirst({
    where: { role: role as TeamRole },
  });
}

export async function repoFindByExternalMessageId(externalMessageId: string) {
  return prisma.inquiry.findUnique({
    where: { externalMessageId },
  });
}
