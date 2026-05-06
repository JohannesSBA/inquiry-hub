/**
 * In-process pub/sub for SSE: emits inquiry lifecycle events to subscribed streams.
 * Single-instance only (dev/small deploy); scale-out would need Redis or Postgres NOTIFY.
 */

import { EventEmitter } from "node:events";

export type InquiryRealtimeEvent =
  | { type: "inquiry.created"; inquiryId: string }
  | { type: "inquiry.updated"; inquiryId: string }
  | { type: "inquiry.classified"; inquiryId: string }
  | { type: "followup.sent"; followUpId: string; inquiryId: string };

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export function subscribeInquiryEvents(
  listener: (payload: InquiryRealtimeEvent) => void,
): () => void {
  emitter.on("event", listener);
  return () => emitter.off("event", listener);
}

export function emitInquiryEvent(payload: InquiryRealtimeEvent): void {
  emitter.emit("event", payload);
}
