import { requireTeamMember } from "@/server/auth/session";
import { repoListDashboardTake } from "@/server/inquiries/repository";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireTeamMember();

  const inquiries = await repoListDashboardTake(50);

  return (
    <DashboardClient
      initialInquiries={JSON.parse(JSON.stringify(inquiries))}
    />
  );
}
