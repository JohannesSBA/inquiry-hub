"use client";

import styles from "./Dashboard.module.css";
import { InquiryRow } from "@/components/dashboard/InquiryRow";

export type InquiryListItem = {
  id: string;
  status: string;
  channel: string;
  subject: string;
  receivedAt: string;
  category: string | null;
  priority: string | null;
  contact: { name: string };
};

export function InquiryList({
  inquiries,
  selectedId,
  onSelect,
}: {
  inquiries: InquiryListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (inquiries.length === 0) {
    return <div className={styles.emptyList}>No inquiries match this filter</div>;
  }

  return (
    <>
      {inquiries.map((inq) => (
        <InquiryRow
          key={inq.id}
          inquiry={inq}
          isSelected={inq.id === selectedId}
          onClick={() => onSelect(inq.id)}
        />
      ))}
    </>
  );
}
