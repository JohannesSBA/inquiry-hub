import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [inquiries, teamMembers, stats] = await Promise.all([
    prisma.inquiry.findMany({
      include: {
        contact: true,
        assignedTo: true,
        followUps: {
          orderBy: { scheduledAt: "desc" },
          take: 3,
        },
      },
      orderBy: [{ receivedAt: "desc" }],
      take: 50,
    }),
    prisma.teamMember.findMany(),
    Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.inquiry.count({ where: { priority: "HIGH" } }),
      prisma.inquiry.count({ where: { status: "REPLIED" } }),
      prisma.inquiry.count({ where: { category: null } }),
    ]),
  ]);

  const [total, newCount, highPriority, replied, unprocessed] = stats;

  return (
    <DashboardClient
      initialInquiries={JSON.parse(JSON.stringify(inquiries))}
      teamMembers={JSON.parse(JSON.stringify(teamMembers))}
      stats={{ total, new: newCount, highPriority, replied, unprocessed }}
    />
  );
}
