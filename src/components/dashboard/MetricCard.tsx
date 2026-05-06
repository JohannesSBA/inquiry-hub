"use client";

import styles from "./Dashboard.module.css";

export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <span
        className={styles.metricValue}
        style={accent ? { color: accent } : {}}
      >
        {value}
      </span>
    </div>
  );
}
