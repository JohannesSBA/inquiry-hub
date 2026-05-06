/**
 * GET /api/inquiries/stream — SSE for live inquiry updates (authenticated).
 */

import { subscribeInquiryEvents } from "@/server/realtime/broadcaster";
import { getOptionalAuthUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getOptionalAuthUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(obj)}\n\n`),
        );
      };

      send({ type: "connected" });

      const unsub = subscribeInquiryEvents((evt) => send(evt));
      const ping = setInterval(() => send({ type: "ping" }), 25000);

      cleanup = () => {
        clearInterval(ping);
        unsub();
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
