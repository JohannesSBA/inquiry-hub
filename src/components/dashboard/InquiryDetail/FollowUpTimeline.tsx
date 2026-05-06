"use client";

import styles from "../Dashboard.module.css";

export function FollowUpTimeline({
  followUps,
}: {
  followUps: Array<{
    id: string;
    attempt: number;
    status: string;
    scheduledAt: string;
    sentAt: string | null;
  }>;
}) {
  if (!followUps?.length) return null;

  return (
    <div className={styles.followUps}>
      <div className={styles.followUpTitle}>Follow-up schedule</div>
      {followUps.map((fu) => (
        <div key={fu.id} className={styles.followUpItem}>
          <span
            className={styles.followUpDot}
            style={{
              background:
                fu.status === "SENT"
                  ? "var(--success)"
                  : fu.status === "PENDING"
                    ? "var(--warning)"
                    : "var(--text-tertiary)",
            }}
          />
          <span className={styles.followUpText}>
            Attempt {fu.attempt} —{" "}
            {fu.status === "SENT"
              ? `Sent ${new Date(fu.sentAt!).toLocaleDateString()}`
              : fu.status === "PENDING"
                ? `Scheduled ${new Date(fu.scheduledAt).toLocaleDateString()}`
                : fu.status}
          </span>
        </div>
      ))}
    </div>
  );
}
