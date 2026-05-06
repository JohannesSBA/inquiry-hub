/**
 * Shared auth checks for JSON API routes (returns null when unauthenticated).
 */

import { NextResponse } from "next/server";
import { getOptionalAuthUser } from "@/server/auth/session";
import { ensureTeamMemberForUser } from "@/server/auth/teamMember";

export async function requireTeamMemberApi() {
  const user = await getOptionalAuthUser();
  if (!user) return null;
  const teamMember = await ensureTeamMemberForUser(user);
  return { user, teamMember };
}

export function jsonUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
