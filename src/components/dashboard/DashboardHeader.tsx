"use client";

import Link from "next/link";
import styles from "./Dashboard.module.css";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export function DashboardHeader({
  processing,
  unprocessedCount,
  onProcessAll,
}: {
  processing: boolean;
  unprocessedCount: number;
  onProcessAll: () => void;
}) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>InquiryHub</h1>
        <p className={styles.subtitle}>AI-powered inquiry management</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/analytics" className={styles.filterBtn}>
          Analytics
        </Link>
        <a href="/api/gmail/connect" className={styles.filterBtn}>
          Gmail
        </a>
        <SignOutButton />
        <button
          type="button"
          onClick={onProcessAll}
          disabled={processing || unprocessedCount === 0}
          className={styles.processAllBtn}
        >
          {processing ? (
            <>
              <span className={styles.spinner} />
              Processing...
            </>
          ) : (
            `✦ Classify all (${unprocessedCount})`
          )}
        </button>
      </div>
    </header>
  );
}
