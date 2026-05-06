/**
 * Prisma access for MailAccount rows.
 */

import { prisma } from "@/lib/prisma";
import type { MailAccount, Prisma } from "@prisma/client";

export async function repoMailAccountByTeamMember(
  teamMemberId: string,
): Promise<MailAccount | null> {
  return prisma.mailAccount.findUnique({ where: { teamMemberId } });
}

export async function repoMailAccountUpsertTokens(args: {
  teamMemberId: string;
  email: string;
  tokensCipher: string;
  tokensIv: string;
  scope?: string | null;
}) {
  return prisma.mailAccount.upsert({
    where: { teamMemberId: args.teamMemberId },
    create: {
      teamMember: { connect: { id: args.teamMemberId } },
      email: args.email,
      tokensCipher: args.tokensCipher,
      tokensIv: args.tokensIv,
      scope: args.scope,
      lastError: null,
    },
    update: {
      email: args.email,
      tokensCipher: args.tokensCipher,
      tokensIv: args.tokensIv,
      scope: args.scope,
      lastError: null,
    },
  });
}

export async function repoMailAccountUpdate(
  id: string,
  data: Prisma.MailAccountUpdateInput,
) {
  return prisma.mailAccount.update({ where: { id }, data });
}

export async function repoMailAccountListAll() {
  return prisma.mailAccount.findMany({
    include: { teamMember: true },
  });
}
