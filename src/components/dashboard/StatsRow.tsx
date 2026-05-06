"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import styles from "./Dashboard.module.css";

export function StatsRow({
  total,
  unprocessed,
  high,
  replied,
}: {
  total: number;
  unprocessed: number;
  high: number;
  replied: number;
}) {
  return (
    <div className={styles.statsRow}>
      <MetricCard label="Total" value={total} />
      <MetricCard
        label="Unprocessed"
        value={unprocessed}
        accent="var(--warning)"
      />
      <MetricCard label="High priority" value={high} accent="var(--danger)" />
      <MetricCard label="Replied" value={replied} accent="var(--success)" />
    </div>
  );
}
