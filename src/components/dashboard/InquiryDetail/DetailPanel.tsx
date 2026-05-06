"use client";

import styles from "../Dashboard.module.css";
import {
  CATEGORY_MAP,
  PRIORITY_MAP,
  STATUS_OPTIONS,
} from "@/components/dashboard/dashboardConstants";
import { Badge } from "@/components/dashboard/Badge";
import { initials, timeAgo } from "@/components/dashboard/dashboardUtils";
import { AiAnalysisCard } from "@/components/dashboard/InquiryDetail/AiAnalysisCard";
import { DraftReplyCard } from "@/components/dashboard/InquiryDetail/DraftReplyCard";
import { FollowUpTimeline } from "@/components/dashboard/InquiryDetail/FollowUpTimeline";

export type DetailInquiry = {
  id: string;
  status: string;
  channel: string;
  subject: string;
  body: string;
  receivedAt: string;
  category: string | null;
  priority: string | null;
  intent: string | null;
  sentiment: string | null;
  aiDraft: string | null;
  contact: {
    name: string;
    email: string;
    company?: string | null;
  };
  assignedTo?: { name: string } | null;
  followUps?: Array<{
    id: string;
    attempt: number;
    status: string;
    scheduledAt: string;
    sentAt: string | null;
  }>;
};

export function DetailPanel({
  inquiry,
  processing,
  onProcess,
  onStatusChange,
  onSaveDraft,
  onSendReply,
}: {
  inquiry: DetailInquiry | null;
  processing: boolean;
  onProcess: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onSaveDraft: (id: string, text: string) => Promise<void>;
  onSendReply: (id: string, text: string) => Promise<void>;
}) {
  if (!inquiry) {
    return (
      <div className={styles.emptyDetail}>
        <div className={styles.emptyIcon}>📬</div>
        <p>Select an inquiry to view details</p>
      </div>
    );
  }

  const cat = inquiry.category ? CATEGORY_MAP[inquiry.category] : null;
  const pri = inquiry.priority ? PRIORITY_MAP[inquiry.priority] : null;

  const nextFu = inquiry.followUps?.[0];

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <div className={styles.detailContact}>
          <div className={styles.detailAvatar}>{initials(inquiry.contact.name)}</div>
          <div>
            <div className={styles.detailName}>{inquiry.contact.name}</div>
            <div className={styles.detailEmail}>{inquiry.contact.email}</div>
            {inquiry.contact.company && (
              <div className={styles.detailCompany}>{inquiry.contact.company}</div>
            )}
          </div>
        </div>

        <select
          value={inquiry.status}
          onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
          className={styles.statusSelect}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <h2 className={styles.detailSubject}>{inquiry.subject}</h2>
      <div className={styles.metaRow}>
        <span className={styles.channelLabel}>{inquiry.channel}</span>
        <span className={styles.timeMeta}>{timeAgo(inquiry.receivedAt)}</span>
        {cat && <Badge {...cat} />}
        {pri && <Badge {...pri} />}
        {inquiry.assignedTo && (
          <span className={styles.assignedBadge}>
            → {inquiry.assignedTo.name}
          </span>
        )}
      </div>

      <div className={styles.inquiryBody}>{inquiry.body}</div>

      {!inquiry.category && (
        <button
          type="button"
          onClick={() => onProcess(inquiry.id)}
          disabled={processing}
          className={styles.classifyBtn}
        >
          {processing ? (
            <>
              <span className={styles.spinner} />
              Classifying...
            </>
          ) : (
            "✦ Classify with AI"
          )}
        </button>
      )}

      {inquiry.category && (
        <AiAnalysisCard
          intent={inquiry.intent}
          sentiment={inquiry.sentiment}
          assignedName={inquiry.assignedTo?.name ?? null}
          nextFollowUpLabel={
            nextFu
              ? new Date(nextFu.scheduledAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "None scheduled"
          }
        />
      )}

      {inquiry.aiDraft && (
        <DraftReplyCard
          inquiryId={inquiry.id}
          draft={inquiry.aiDraft}
          processing={processing}
          onSaveDraft={onSaveDraft}
          onSend={onSendReply}
        />
      )}

      <FollowUpTimeline followUps={inquiry.followUps ?? []} />
    </div>
  );
}
