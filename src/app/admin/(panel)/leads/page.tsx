import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models";
import { Card, PageHeader, fmtDate } from "@/components/admin/ui";
import { LeadRow } from "@/components/admin/LeadRow";

export const metadata = { title: "Business leads" };

export default async function LeadsPage() {
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  return (
    <>
      <PageHeader title="Business leads" subtitle="Manpower quotation requests from the “For employers” form." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Company</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Need</th>
                <th className="px-3 py-3">Received</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {leads.map((l) => (
                <LeadRow
                  key={String(l._id)}
                  lead={{
                    id: String(l._id),
                    company: l.company,
                    name: l.name,
                    designation: l.designation ?? "",
                    phone: l.phone ?? "",
                    email: l.email ?? "",
                    businessType: l.businessType ?? "",
                    headcount: l.headcount ?? "",
                    received: fmtDate(l.createdAt, true),
                    status: l.status,
                    notes: l.notes ?? "",
                  }}
                />
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted">
                    No quotation requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
