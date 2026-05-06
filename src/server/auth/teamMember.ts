/**
 * Links Neon Auth users to local TeamMember rows for routing and Gmail accounts.
 */

import type { TeamRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthUserLike = {
  id: string;
  email: string;
  name?: string | null;
};

export async function ensureTeamMemberForUser(user: AuthUserLike) {
  const byAuth = await prisma.teamMember.findUnique({
    where: { authUserId: user.id },
  });
  if (byAuth) {
    if (byAuth.email !== user.email || (user.name && byAuth.name !== user.name)) {
      return prisma.teamMember.update({
        where: { id: byAuth.id },
        data: {
          email: user.email,
          ...(user.name ? { name: user.name } : {}),
        },
      });
    }
    return byAuth;
  }

  const byEmail = await prisma.teamMember.findUnique({
    where: { email: user.email },
  });
  if (byEmail) {
    return prisma.teamMember.update({
      where: { id: byEmail.id },
      data: {
        authUserId: user.id,
        ...(user.name ? { name: user.name } : {}),
      },
    });
  }

  const count = await prisma.teamMember.count();
  const role: TeamRole = count === 0 ? "FOUNDER" : "SALES";

  return prisma.teamMember.create({
    data: {
      authUserId: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      role,
    },
  });
}
