import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { requireSession } from "@/lib/auth";
import { PageHeader, fmtDate } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/TeamManager";

export const metadata = { title: "Team" };

export default async function UsersPage() {
  const s = await requireSession("admin");
  await connectDB();
  const users = await User.find().sort({ createdAt: 1 }).lean();
  return (
    <>
      <PageHeader title="Team" subtitle="Admins manage everything. Recruiters can work candidates, jobs and leads but can't delete or manage the team." />
      <TeamManager
        me={s.uid}
        users={users.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: !!u.isActive,
          lastLogin: u.lastLoginAt ? fmtDate(u.lastLoginAt, true) : "Never",
        }))}
      />
    </>
  );
}
