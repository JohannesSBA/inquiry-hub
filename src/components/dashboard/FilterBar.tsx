"use client";

import styles from "./Dashboard.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "unprocessed", label: "Unprocessed" },
  { key: "high", label: "High priority" },
] as const;

export function FilterBar({
  filter,
  search,
  onFilter,
  onSearch,
}: {
  filter: string;
  search: string;
  onFilter: (key: string) => void;
  onSearch: (v: string) => void;
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilter(f.key)}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Search inquiries..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
}
