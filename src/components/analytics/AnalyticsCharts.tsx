"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const COLORS = [
  "#3c3489",
  "#085041",
  "#0c447c",
  "#993c1d",
  "#72243e",
  "#27500a",
  "#444441",
];

/**
 * Client-only charts for analytics page (keeps RSC bundle small).
 */
export function AnalyticsCharts({
  volume,
  categories,
}: {
  volume: Array<{ day: string; count: number }>;
  categories: Array<{ category: string; count: number }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Volume (30 days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={volume}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3c3489" name="Inquiries" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>By category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#085041" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Category mix</h2>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={categories}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {categories.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
