import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Candidate, Lead } from "@/lib/models";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · KelasaHub Admin" }, robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireSession();
  await connectDB();
  const [newCandidates, newLeads] = await Promise.all([
    Candidate.countDocuments({ screeningStatus: "New" }),
    Lead.countDocuments({ status: "New" }),
  ]);
  return (
    <div className="min-h-dvh bg-[#f4f5f7] lg:pl-64">
      <Sidebar user={{ name: session.name, email: session.email, role: session.role }} counts={{ newCandidates, newLeads }} />
      <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
    </div>
  );
}
