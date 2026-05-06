/**
 * Read-only aggregates for the analytics dashboard.
 */

import { prisma } from "@/lib/prisma";

export async function inquiryVolumeByDay(days: number) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const rows = await prisma.$queryRaw<
    Array<{ day: Date; count: bigint }>
  >`
    SELECT date_trunc('day', "receivedAt") AS day, COUNT(*)::bigint AS count
    FROM "Inquiry"
    WHERE "receivedAt" >= ${from}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    count: Number(r.count),
  }));
}

export async function categoryBreakdown() {
  const rows = await prisma.inquiry.groupBy({
    by: ["category"],
    _count: true,
    where: { category: { not: null } },
  });
  return rows.map((r) => ({
    category: r.category as string,
    count: r._count,
  }));
}

export async function averageResponseTimeHours() {
  const rows = await prisma.$queryRaw<Array<{ avg_seconds: unknown }>>`
    SELECT AVG(EXTRACT(EPOCH FROM ("repliedAt" - "receivedAt")))::float AS avg_seconds
    FROM "Inquiry"
    WHERE "status" = 'REPLIED'
      AND "repliedAt" IS NOT NULL
  `;
  const sec = Number(rows[0]?.avg_seconds ?? 0);
  return sec > 0 ? sec / 3600 : null;
}

/** Share of inquiries that received at least one SENT follow-up before eventual REPLIED. */
export async function followUpConversionRate() {
  const [withFu, totalReplied] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT i.id)::bigint AS count
      FROM "Inquiry" i
      INNER JOIN "FollowUp" f ON f."inquiryId" = i.id
      WHERE i.status = 'REPLIED'
        AND f.status = 'SENT'
    `,
    prisma.inquiry.count({ where: { status: "REPLIED" } }),
  ]);
  const n = Number(withFu[0]?.count ?? 0);
  if (totalReplied === 0) return null;
  return (n / totalReplied) * 100;
}
