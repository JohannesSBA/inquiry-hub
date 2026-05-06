"use client";

import styles from "./Dashboard.module.css";
import { Badge } from "@/components/dashboard/Badge";
import {
  CATEGORY_MAP,
  PRIORITY_MAP,
} from "@/components/dashboard/dashboardConstants";
import { initials, timeAgo } from "@/components/dashboard/dashboardUtils";

export function InquiryRow({
  inquiry,
  isSelected,
  onClick,
}: {
  inquiry: {
    id: string;
    status: string;
    channel: string;
    subject: string;
    receivedAt: string;
    category: string | null;
    priority: string | null;
    contact: { name: string };
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  const cat = inquiry.category ? CATEGORY_MAP[inquiry.category] : null;
  const pri = inquiry.priority ? PRIORITY_MAP[inquiry.priority] : null;

  return (
    <div
      className={`${styles.inquiryRow} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
    >
      <div
        className={styles.avatar}
        style={{
          background:
            inquiry.status === "NEW"
              ? "var(--accent-bg)"
              : "var(--bg-tertiary)",
          color:
            inquiry.status === "NEW"
              ? "var(--accent-text)"
              : "var(--text-tertiary)",
        }}
      >
        {initials(inquiry.contact.name)}
      </div>

      <div className={styles.inquiryContent}>
        <div className={styles.inquiryHeader}>
          <span className={styles.contactName}>{inquiry.contact.name}</span>
          <span className={styles.channelIcon}>
            {inquiry.channel === "EMAIL"
              ? "✉"
              : inquiry.channel === "FORM"
                ? "📋"
                : "💬"}
          </span>
          <span className={styles.timeAgo}>{timeAgo(inquiry.receivedAt)}</span>
        </div>
        <div className={styles.inquirySubject}>{inquiry.subject}</div>
        {(cat || pri) && (
          <div className={styles.badgeRow}>
            {cat && <Badge {...cat} />}
            {pri && <Badge {...pri} />}
          </div>
        )}
      </div>

      {inquiry.status === "NEW" && <div className={styles.newDot} />}
    </div>
  );
}
