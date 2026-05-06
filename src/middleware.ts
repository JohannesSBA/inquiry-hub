/**
 * Protects app routes; leaves inbound webhooks and Neon Auth proxy public.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { neonAuth } from "@/server/auth/neon";

const neonMw = neonAuth.middleware({ loginUrl: "/sign-in" });

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname === "/") return true;
  if (pathname === "/sign-in") return true;
  if (pathname === "/pricing") return true;
  if (pathname === "/privacy-policy") return true;
  if (pathname === "/terms-of-service") return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/inquiries")) return true;
  if (pathname.startsWith("/api/webhooks")) return true;
  if (pathname === "/api/gmail/sync") return true;
  if (pathname === "/api/gmail/callback") return true;
  return false;
}

export default async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return neonMw(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
