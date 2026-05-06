/**
 * Proxies Neon Auth (Better Auth) traffic — mount at /api/auth/*
 */

import { neonAuth } from "@/server/auth/neon";

export const dynamic = "force-dynamic";

const handler = neonAuth.handler();

type Params = { all: string[] };

export async function GET(
  request: Request,
  context: { params: Params },
) {
  return handler.GET(request, {
    params: Promise.resolve({ path: context.params.all }),
  });
}

export async function POST(
  request: Request,
  context: { params: Params },
) {
  return handler.POST(request, {
    params: Promise.resolve({ path: context.params.all }),
  });
}

export async function PUT(
  request: Request,
  context: { params: Params },
) {
  return handler.PUT(request, {
    params: Promise.resolve({ path: context.params.all }),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Params },
) {
  return handler.PATCH(request, {
    params: Promise.resolve({ path: context.params.all }),
  });
}

export async function DELETE(
  request: Request,
  context: { params: Params },
) {
  return handler.DELETE(request, {
    params: Promise.resolve({ path: context.params.all }),
  });
}
