"use client";

import { useCallback, useMemo, useState } from "react";
import type { DetailInquiry } from "@/components/dashboard/InquiryDetail/DetailPanel";
import { useInquiryStream } from "@/components/dashboard/hooks/useInquiryStream";

export function useInquiries(initialInquiries: DetailInquiry[]) {
  const [inquiries, setInquiries] = useState<DetailInquiry[]>(initialInquiries);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/inquiries?limit=50");
    const data = await res.json();
    setInquiries(data.inquiries);
  }, []);

  const refreshOne = useCallback(async (id: string) => {
    const res = await fetch(`/api/inquiries/${id}`);
    if (!res.ok) return;
    const row = (await res.json()) as DetailInquiry;
    setInquiries((prev) => prev.map((i) => (i.id === id ? row : i)));
  }, []);

  useInquiryStream(refreshOne, refreshList);

  const selected = useMemo(
    () => inquiries.find((i) => i.id === selectedId) || null,
    [inquiries, selectedId],
  );

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (filter === "new") return inq.status === "NEW";
      if (filter === "processed") return inq.category !== null;
      if (filter === "high") return inq.priority === "HIGH";
      if (filter === "unprocessed") return inq.category === null;
      if (search) {
        const q = search.toLowerCase();
        return (
          inq.subject.toLowerCase().includes(q) ||
          inq.contact.name.toLowerCase().includes(q) ||
          inq.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inquiries, filter, search]);

  const liveStats = useMemo(
    () => ({
      total: inquiries.length,
      unprocessed: inquiries.filter((i) => !i.category).length,
      high: inquiries.filter((i) => i.priority === "HIGH").length,
      replied: inquiries.filter((i) => i.status === "REPLIED").length,
    }),
    [inquiries],
  );

  const handleProcess = useCallback(async (id: string) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/inquiries/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId: id }),
      });
      if (!res.ok) {
        console.error("Process failed:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? data.inquiry : i)),
        );
      }
    } catch (err) {
      console.error("Process failed:", err);
    }
    setProcessing(false);
  }, []);

  const handleProcessAll = useCallback(async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/inquiries/process-all", { method: "POST" });
      if (!res.ok) {
        console.error("Batch process failed:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      if (data.success) await refreshList();
    } catch (err) {
      console.error("Batch process failed:", err);
    }
    setProcessing(false);
  }, [refreshList]);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = (await res.json()) as DetailInquiry;
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      console.error("Status update failed:", err);
    }
  }, []);

  const handleSaveDraft = useCallback(async (id: string, text: string) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiDraft: text }),
    });
    const updated = (await res.json()) as DetailInquiry;
    setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }, []);

  const handleSendReply = useCallback(
    async (id: string, text: string) => {
      await fetch(`/api/inquiries/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      await refreshOne(id);
    },
    [refreshOne],
  );

  return {
    inquiries,
    selectedId,
    setSelectedId,
    processing,
    filter,
    setFilter,
    search,
    setSearch,
    selected,
    filteredInquiries,
    liveStats,
    handleProcess,
    handleProcessAll,
    handleStatusChange,
    handleSaveDraft,
    handleSendReply,
  };
}
