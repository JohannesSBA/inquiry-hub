/**
 * Normalize external webhook payloads into the shared inbound inquiry pipeline.
 */

import type { Channel } from "@prisma/client";
import type { InboundInquiry } from "@/types";
import { serviceCreateInbound } from "@/server/inquiries/service";

export async function dispatchInbound(inbound: InboundInquiry) {
  return serviceCreateInbound(inbound);
}

export function channelFromString(s: string): Channel | null {
  const up = s.toUpperCase();
  if (up === "EMAIL" || up === "FORM" || up === "SOCIAL" || up === "API") {
    return up as Channel;
  }
  return null;
}
