import Link from "next/link";
import { requireTeamMember } from "@/server/auth/session";
import {
  averageResponseTimeHours,
  categoryBreakdown,
  followUpConversionRate,
  inquiryVolumeByDay,
} from "@/server/analytics/queries";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export const dynamic = "force-dynamic";

/**
 * Aggregated inquiry metrics for ops review.
 */
export default async function AnalyticsPage() {
  await requireTeamMember();

  const [volume, categories, avgHours, fuRate] = await Promise.all([
    inquiryVolumeByDay(30),
    categoryBreakdown(),
    averageResponseTimeHours(),
    followUpConversionRate(),
  ]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/dashboard">← Dashboard</Link>
        <h1 style={{ margin: 0 }}>Analytics</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Metric label="Avg. response time (hours)" value={avgHours != null ? avgHours.toFixed(1) : "—"} />
        <Metric
          label="Follow-up → replied (approx.)"
          value={fuRate != null ? `${fuRate.toFixed(1)}%` : "—"}
        />
      </div>

      <AnalyticsCharts volume={volume} categories={categories} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
