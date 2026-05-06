"use client";

import styles from "../Dashboard.module.css";

export function AiAnalysisCard({
  intent,
  sentiment,
  assignedName,
  nextFollowUpLabel,
}: {
  intent: string | null;
  sentiment: string | null;
  assignedName: string | null;
  nextFollowUpLabel: string;
}) {
  return (
    <div className={styles.aiCard}>
      <div className={styles.aiCardTitle}>AI analysis</div>
      <div className={styles.aiGrid}>
        <div>
          <div className={styles.aiLabel}>Intent</div>
          <div className={styles.aiValue}>{intent}</div>
        </div>
        <div>
          <div className={styles.aiLabel}>Sentiment</div>
          <div className={styles.aiValue}>
            {sentiment
              ? sentiment.charAt(0) + sentiment.slice(1).toLowerCase()
              : ""}
          </div>
        </div>
        <div>
          <div className={styles.aiLabel}>Routed to</div>
          <div className={styles.aiValue}>{assignedName || "Unassigned"}</div>
        </div>
        <div>
          <div className={styles.aiLabel}>Next follow-up</div>
          <div className={styles.aiValue}>{nextFollowUpLabel}</div>
        </div>
      </div>
    </div>
  );
}
