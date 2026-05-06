"use client";

import { useEffect } from "react";

/**
 * Subscribes to SSE inquiry events; callbacks trigger targeted refetches.
 */
export function useInquiryStream(
  onInquiryMutation: (inquiryId: string) => void,
  onInquiryCreated: () => void,
) {
  useEffect(() => {
    const url = `${window.location.origin}/api/inquiries/stream`;
    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as {
          type?: string;
          inquiryId?: string;
        };
        if (!data.type || data.type === "ping" || data.type === "connected") {
          return;
        }
        if (data.type === "inquiry.created") {
          onInquiryCreated();
          return;
        }
        if (
          (data.type === "inquiry.updated" ||
            data.type === "inquiry.classified" ||
            data.type === "followup.sent") &&
          data.inquiryId
        ) {
          onInquiryMutation(data.inquiryId);
        }
      } catch {
        /* ignore malformed */
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [onInquiryMutation, onInquiryCreated]);
}
