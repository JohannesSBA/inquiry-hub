/**
 * Server-side session helpers for pages and route handlers.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/server/config/env";
import { neonAuth } from "@/server/auth/neon";
import {
  ensureTeamMemberForUser,
  type AuthUserLike,
} from "@/server/auth/teamMember";
import type { TeamMember } from "@prisma/client";

function allowedEmailDomain(email: string): boolean {
  const raw = env.AUTH_ALLOWED_EMAIL_DOMAINS?.trim();
  if (!raw) return true;
  const domains = raw.split(",").map((d) => d.trim().toLowerCase());
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && domains.includes(domain);
}

export async function getSession() {
  const h = await headers();
  return neonAuth.getSession({ headers: h });
}

export async function requireUser(): Promise<AuthUserLike> {
  const { data: session, error } = await getSession();
  if (error || !session?.user?.email) {
    redirect("/sign-in");
  }
  const user = session.user;
  const authUser: AuthUserLike = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  if (!allowedEmailDomain(authUser.email)) {
    redirect("/sign-in?error=forbidden");
  }
  return authUser;
}

export async function requireTeamMember(): Promise<{
  user: AuthUserLike;
  teamMember: TeamMember;
}> {
  const user = await requireUser();
  const teamMember = await ensureTeamMemberForUser(user);
  return { user, teamMember };
}

/** Use in API routes — returns null if unauthenticated or domain blocked. */
export async function getOptionalAuthUser(): Promise<AuthUserLike | null> {
  const { data: session } = await getSession();
  const email = session?.user?.email;
  const id = session?.user?.id;
  if (!email || !id) return null;
  if (!allowedEmailDomain(email)) return null;
  return {
    id,
    email,
    name: session.user.name,
  };
}

export async function requireAuthUserApi(): Promise<AuthUserLike> {
  const user = await getOptionalAuthUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
