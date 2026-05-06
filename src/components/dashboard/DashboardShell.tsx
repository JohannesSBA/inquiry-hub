"use client";

import styles from "./Dashboard.module.css";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { InquiryList } from "@/components/dashboard/InquiryList";
import type { DetailInquiry } from "@/components/dashboard/InquiryDetail/DetailPanel";
import { DetailPanel } from "@/components/dashboard/InquiryDetail/DetailPanel";
import { useInquiries } from "@/components/dashboard/hooks/useInquiries";

/**
 * Client dashboard shell: list/detail split, AI actions, SSE refresh.
 */
export function DashboardShell({
  initialInquiries,
}: {
  initialInquiries: DetailInquiry[];
}) {
  const {
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
  } = useInquiries(initialInquiries);

  return (
    <div className={styles.container}>
      <DashboardHeader
        processing={processing}
        unprocessedCount={liveStats.unprocessed}
        onProcessAll={handleProcessAll}
      />

      <StatsRow
        total={liveStats.total}
        unprocessed={liveStats.unprocessed}
        high={liveStats.high}
        replied={liveStats.replied}
      />

      <FilterBar
        filter={filter}
        search={search}
        onFilter={setFilter}
        onSearch={setSearch}
      />

      <div className={styles.splitView}>
        <div className={styles.listPane}>
          <InquiryList
            inquiries={filteredInquiries}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className={styles.detailPane}>
          <DetailPanel
            inquiry={selected}
            processing={processing}
            onProcess={handleProcess}
            onStatusChange={handleStatusChange}
            onSaveDraft={handleSaveDraft}
            onSendReply={handleSendReply}
          />
        </div>
      </div>
    </div>
  );
}
