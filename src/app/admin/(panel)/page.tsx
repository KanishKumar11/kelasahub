import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarClock, Mail, PhoneCall, UserPlus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Candidate, Lead } from "@/lib/models";
import { Card, PageHeader, btn, fmtDate, relTime } from "@/components/admin/ui";
import { BarList, DailyBars } from "@/components/admin/Charts";

export const metadata = { title: "Dashboard" };

const DAY = 86_400_000;

export default async function Dashboard() {
  await connectDB();
  const now = new Date();
  const startOfToday = new Date(now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30");
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const since30 = new Date(startOfToday.getTime() - 29 * DAY);

  const [
    total,
    newThisWeek,
    shortlisted,
    interviewsUpcoming,
    selectedThisMonth,
    funnelAgg,
    perDay,
    bySource,
    byRole,
    ttf,
    retention,
    staleNew,
    upcoming,
    noEmail,
    joiningSoon,
    newLeads,
    recent,
  ] = await Promise.all([
    Candidate.countDocuments(),
    Candidate.countDocuments({ dateApplied: { $gte: weekAgo } }),
    Candidate.countDocuments({ screeningStatus: "Shortlisted", overallStatus: { $nin: ["Selected", "Rejected", "Dropped Out"] } }),
    Candidate.countDocuments({ interviewStatus: { $in: ["Scheduled", "Rescheduled"] } }),
    Candidate.countDocuments({ overallStatus: "Selected", dateSelected: { $gte: monthStart } }),
    Candidate.aggregate<{ applied: number; screened: number; shortlisted: number; interviewed: number; selected: number; joined: number }>([
      {
        $group: {
          _id: null,
          applied: { $sum: 1 },
          screened: { $sum: { $cond: [{ $ne: ["$screeningStatus", "New"] }, 1, 0] } },
          shortlisted: { $sum: { $cond: [{ $or: [{ $eq: ["$screeningStatus", "Shortlisted"] }, { $eq: ["$overallStatus", "Selected"] }] }, 1, 0] } },
          interviewed: { $sum: { $cond: [{ $or: [{ $eq: ["$interviewStatus", "Completed"] }, { $eq: ["$overallStatus", "Selected"] }] }, 1, 0] } },
          selected: { $sum: { $cond: [{ $eq: ["$overallStatus", "Selected"] }, 1, 0] } },
          joined: { $sum: { $cond: [{ $and: [{ $eq: ["$overallStatus", "Selected"] }, { $lte: ["$joiningDate", now] }, { $ne: ["$joiningDate", null] }] }, 1, 0] } },
        },
      },
    ]),
    Candidate.aggregate<{ _id: string; n: number }>([
      { $match: { dateApplied: { $gte: since30 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateApplied", timezone: "Asia/Kolkata" } }, n: { $sum: 1 } } },
    ]),
    Candidate.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$source", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Candidate.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$role", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 7 }]),
    Candidate.aggregate<{ avg: number }>([
      { $match: { dateSelected: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ["$dateSelected", "$dateApplied"] }, DAY] } } } },
    ]),
    Candidate.aggregate<{ _id: string; n: number }>([
      { $match: { firstMonthAttrition: { $in: ["Retained", "Attrited"] } } },
      { $group: { _id: "$firstMonthAttrition", n: { $sum: 1 } } },
    ]),
    Candidate.find({ screeningStatus: "New", dateApplied: { $lte: new Date(now.getTime() - 2 * DAY) } })
      .sort({ dateApplied: 1 })
      .limit(6)
      .select("name role dateApplied phone")
      .lean(),
    Candidate.find({ interviewStatus: { $in: ["Scheduled", "Rescheduled"] } })
      .sort({ interviewDate: 1 })
      .limit(6)
      .select("name role interviewDate")
      .lean(),
    Candidate.find({ overallStatus: "Selected", selectionEmailSent: { $ne: true } }).limit(6).select("name role dateSelected").lean(),
    Candidate.find({ joiningDate: { $gte: startOfToday, $lte: new Date(now.getTime() + 7 * DAY) } })
      .sort({ joiningDate: 1 })
      .limit(6)
      .select("name role joiningDate")
      .lean(),
    Lead.countDocuments({ status: "New" }),
    Candidate.find().sort({ dateApplied: -1 }).limit(8).select("name role source dateApplied screeningStatus").lean(),
  ]);

  const f = funnelAgg[0] ?? { applied: 0, screened: 0, shortlisted: 0, interviewed: 0, selected: 0, joined: 0 };
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since30.getTime() + i * DAY);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return { key, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), n: perDay.find((p) => p._id === key)?.n ?? 0 };
  });
  const retained = retention.find((r) => r._id === "Retained")?.n ?? 0;
  const attrited = retention.find((r) => r._id === "Attrited")?.n ?? 0;
  const retentionRate = retained + attrited ? Math.round((retained / (retained + attrited)) * 100) : null;
  const avgTtf = ttf[0]?.avg;

  const kpis = [
    { label: "Total candidates", value: total, hint: `+${newThisWeek} this week`, href: "/admin/candidates" },
    { label: "Active shortlist", value: shortlisted, hint: "shortlisted, not closed", href: "/admin/candidates?screening=Shortlisted" },
    { label: "Interviews pending", value: interviewsUpcoming, hint: "scheduled / rescheduled", href: "/admin/candidates?interview=Scheduled" },
    { label: "Selected this month", value: selectedThisMonth, hint: avgTtf != null ? `avg ${avgTtf.toFixed(1)} days to fill` : "no selections yet", href: "/admin/candidates?overall=Selected" },
    { label: "1st-month retention", value: retentionRate != null ? `${retentionRate}%` : "—", hint: `${retained} retained · ${attrited} attrited`, href: "/admin/candidates?overall=Selected" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
        actions={
          <>
            {newLeads > 0 && (
              <Link href="/admin/leads" className={btn.secondary}>
                {newLeads} new business lead{newLeads > 1 ? "s" : ""}
              </Link>
            )}
            <Link href="/admin/candidates/new" className={btn.primary}>
              <UserPlus className="size-4" /> Add candidate
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group">
            <Card className="h-full p-5 transition group-hover:border-teal/40 group-hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{k.label}</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{k.value}</p>
              <p className="mt-1 text-xs text-muted">{k.hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Applications · last 30 days</h2>
            <span className="text-sm text-muted">{days.reduce((a, d) => a + d.n, 0)} total</span>
          </div>
          <DailyBars data={days} />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Hiring funnel</h2>
          <p className="text-xs text-muted">All-time, each stage as a share of applications</p>
          <BarList
            className="mt-4"
            total={f.applied}
            showPct
            items={[
              { label: "Applied", n: f.applied },
              { label: "Screened", n: f.screened },
              { label: "Shortlisted", n: f.shortlisted },
              { label: "Interviewed", n: f.interviewed },
              { label: "Selected", n: f.selected },
              { label: "Joined", n: f.joined },
            ]}
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <TaskList
          title="Waiting for first call"
          icon={<AlertCircle className="size-4 text-amber-600" />}
          empty="Everyone new has been screened 🎉"
          items={staleNew.map((c) => ({ id: String(c._id), name: c.name, sub: c.role, meta: relTime(c.dateApplied) }))}
          more={{ href: "/admin/candidates?screening=New&sort=oldest", label: "All new candidates" }}
        />
        <TaskList
          title="Interviews"
          icon={<CalendarClock className="size-4 text-violet-600" />}
          empty="No interviews scheduled"
          items={upcoming.map((c) => ({ id: String(c._id), name: c.name, sub: c.role, meta: c.interviewDate ? fmtDate(c.interviewDate) : "date not set" }))}
          more={{ href: "/admin/candidates?interview=Scheduled", label: "All scheduled" }}
        />
        <TaskList
          title="Selection email pending"
          icon={<Mail className="size-4 text-teal-deep" />}
          empty="All selected candidates emailed"
          items={noEmail.map((c) => ({ id: String(c._id), name: c.name, sub: c.role, meta: fmtDate(c.dateSelected) }))}
        />
        <TaskList
          title="Joining this week"
          icon={<PhoneCall className="size-4 text-emerald-600" />}
          empty="No joiners in the next 7 days"
          items={joiningSoon.map((c) => ({ id: String(c._id), name: c.name, sub: c.role, meta: fmtDate(c.joiningDate) }))}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-semibold">By source</h2>
          <BarList className="mt-4" items={bySource.map((s) => ({ label: s._id || "Unknown", n: s.n, href: `/admin/candidates?source=${encodeURIComponent(s._id || "")}` }))} />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Top roles</h2>
          <BarList className="mt-4" items={byRole.map((s) => ({ label: s._id || "Unspecified", n: s.n, href: `/admin/candidates?q=${encodeURIComponent(s._id || "")}` }))} />
        </Card>
        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Latest applications</h2>
            <Link href="/admin/candidates" className="text-xs font-semibold text-teal-deep hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-black/5">
            {recent.map((c) => (
              <li key={String(c._id)}>
                <Link href={`/admin/candidates/${c._id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-teal-deep">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {c.role} · {c.source}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{relTime(c.dateApplied)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function TaskList({
  title,
  icon,
  items,
  empty,
  more,
}: {
  title: string;
  icon: React.ReactNode;
  items: { id: string; name: string; sub: string; meta: string }[];
  empty: string;
  more?: { href: string; label: string };
}) {
  return (
    <Card className="flex flex-col p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        {icon} {title}
        {items.length > 0 && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{items.length}</span>}
      </h2>
      {items.length === 0 ? (
        <p className="mt-6 flex-1 text-center text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex-1 divide-y divide-black/5">
          {items.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/candidates/${c.id}`} className="flex items-center justify-between gap-3 py-2 hover:text-teal-deep">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-muted">{c.sub}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{c.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {more && items.length > 0 && (
        <Link href={more.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-deep hover:underline">
          {more.label} <ArrowRight className="size-3" />
        </Link>
      )}
    </Card>
  );
}
