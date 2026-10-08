import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Mail, MapPin, Phone } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Candidate, Job, Partner, Resume, timeToFill } from "@/lib/models";
import {
  ATTRITION,
  INTERVIEW_STATUS,
  OVERALL_STATUS,
  QUALITY,
  SCREENING_STATUS,
  SHIFT_PREFERENCE,
  TRAINING,
  candidateWhatsApp,
} from "@/lib/constants";
import { mailConfigured, selectionEmail } from "@/lib/mail";
import { requireSession } from "@/lib/auth";
import { Badge, Card, Label, btn, fmtDate, toDateInput } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { Timeline } from "@/components/admin/Timeline";
import { SelectionEmail } from "@/components/admin/SelectionEmail";
import { DeleteCandidate } from "@/components/admin/DeleteCandidate";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

export default async function CandidatePage(props: PageProps<"/admin/candidates/[id]">) {
  const { id } = await props.params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  const session = await requireSession();
  await connectDB();
  const c = await Candidate.findById(id)
    .populate<{ partner: { _id: unknown; name: string; location: string; address: string } | null }>("partner", "name location address")
    .lean();
  if (!c) notFound();

  const [partners, jobs, others, hasResume] = await Promise.all([
    Partner.find({ isActive: true }).sort({ name: 1 }).select("name").lean(),
    Job.find().select("title").lean(),
    Candidate.find({ phone: c.phone, _id: { $ne: c._id } }).select("candidateId role dateApplied screeningStatus overallStatus").sort({ dateApplied: -1 }).lean(),
    c.email ? Resume.exists({ email: c.email }).then(Boolean) : false,
  ]);

  const ttf = timeToFill(c);
  const email = selectionEmail({ ...c, email: c.email ?? "", role: c.role ?? "" });
  const pipeline: { label: string; field: Parameters<typeof StatusSelect>[0]["field"]; options: readonly string[]; value: string; empty?: boolean }[] = [
    { label: "Screening", field: "screeningStatus", options: SCREENING_STATUS, value: c.screeningStatus },
    { label: "Interview", field: "interviewStatus", options: INTERVIEW_STATUS, value: c.interviewStatus },
    { label: "Overall", field: "overallStatus", options: OVERALL_STATUS, value: c.overallStatus ?? "", empty: true },
    { label: "Quality", field: "quality", options: QUALITY, value: c.quality ?? "", empty: true },
    { label: "Shift", field: "shiftPreference", options: SHIFT_PREFERENCE, value: c.shiftPreference ?? "", empty: true },
    { label: "1st-month attrition", field: "firstMonthAttrition", options: ATTRITION, value: c.firstMonthAttrition ?? "", empty: true },
    { label: "Training", field: "trainingGraduation", options: TRAINING, value: c.trainingGraduation ?? "", empty: true },
  ];

  return (
    <>
      <Link href="/admin/candidates" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Candidates
      </Link>

      {/* Header */}
      <Card className="mb-4 overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-xl font-bold text-white">
              {c.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{c.name}</h1>
              <p className="mt-0.5 text-sm text-muted">
                <span className="font-mono">{c.candidateId}</span> · {c.role || "No role"} · {c.partner?.name ?? "No partner"} · applied{" "}
                {fmtDate(c.dateApplied, true)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge value={c.source ?? ""} />
                {c.overallStatus && <Badge value={c.overallStatus} />}
                {c.emailVerifiedAt && (
                  <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal-deep" title={`Verified ${fmtDate(c.emailVerifiedAt, true)}`}>
                    ✓ Email verified
                  </span>
                )}
                {c.selectionEmailSent && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Selection email sent</span>}
                {ttf != null && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Time to fill: {ttf} days</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <a href={`tel:${c.phone}`} className={btn.secondary}>
              <Phone className="size-4" /> {c.phone}
            </a>
            <a
              href={candidateWhatsApp(c.phone, `Hi ${c.name.split(" ")[0]}, this is KelasaHub regarding your application for ${c.role}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={btn.secondary}
            >
              <WhatsAppIcon className="size-4 text-[#1da851]" /> WhatsApp
            </a>
            {c.email && (
              <a href={`mailto:${c.email}`} className={btn.secondary}>
                <Mail className="size-4" /> Email
              </a>
            )}
            <a href={`/api/admin/pdf/application?ids=${id}`} target="_blank" className={btn.primary}>
              <FileText className="size-4" /> Application PDF
            </a>
            {c.geo?.lat != null && c.geo?.lng != null && (
              <a href={`https://www.google.com/maps?q=${c.geo.lat},${c.geo.lng}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                <MapPin className="size-4" /> Map
              </a>
            )}
            {hasResume && (
              <a href={`/api/admin/pdf/resume?email=${encodeURIComponent(c.email)}`} target="_blank" className={btn.secondary}>
                <FileText className="size-4" /> Resume
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/5 bg-slate-50/60 p-5 sm:grid-cols-4 lg:grid-cols-7 sm:p-6">
          {pipeline.map((p) => (
            <div key={p.field}>
              <Label>{p.label}</Label>
              <StatusSelect id={id} field={p.field} value={p.value} options={p.options} allowEmpty={p.empty} size="md" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <CandidateForm
          id={id}
          partners={partners.map((p) => ({ id: String(p._id), name: p.name }))}
          roles={jobs.map((j) => j.title)}
          values={{
            name: c.name,
            phone: c.phone,
            email: c.email ?? "",
            source: c.source ?? "",
            role: c.role ?? "",
            partner: c.partner ? String(c.partner._id) : "",
            area: c.area ?? "",
            nationality: c.nationality ?? "",
            address: c.address ?? "",
            pincode: c.pincode ?? "",
            languages: [...(c.languages ?? []), ...(c.intlLanguages ?? [])].join(", "),
            employmentStatus: c.employmentStatus ?? "",
            expYears: c.expYears ?? "",
            lastCompany: c.lastCompany ?? "",
            targetSalary: c.targetSalary ?? "",
            referredBy: c.referredBy ?? "",
            edu_tenth: c.education?.tenth ?? "",
            edu_twelfth: c.education?.twelfth ?? "",
            edu_graduate: c.education?.graduate ?? "",
            edu_postGraduate: c.education?.postGraduate ?? "",
            interviewDate: toDateInput(c.interviewDate),
            dateSelected: toDateInput(c.dateSelected),
            joiningDate: toDateInput(c.joiningDate),
            lastContacted: toDateInput(c.lastContacted),
            notes: c.notes ?? "",
          }}
        />

        <div className="space-y-4">
          {c.overallStatus === "Selected" && (
            <SelectionEmail
              id={id}
              sent={!!c.selectionEmailSent}
              sentAt={c.selectionEmailSentAt ? fmtDate(c.selectionEmailSentAt, true) : null}
              hasEmail={!!c.email}
              smtp={mailConfigured()}
              mailto={c.email ? `mailto:${c.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.text)}` : ""}
            />
          )}
          {others.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold">Other applications from this number</h2>
              <ul className="mt-3 space-y-2">
                {others.map((o) => (
                  <li key={String(o._id)}>
                    <Link href={`/admin/candidates/${o._id}`} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{o.role}</span>
                        <span className="text-xs text-muted">
                          {o.candidateId} · {fmtDate(o.dateApplied)}
                        </span>
                      </span>
                      <Badge value={o.overallStatus || o.screeningStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Timeline
            id={id}
            items={[...(c.activity ?? [])]
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
              .map((a) => ({ id: String(a._id), at: new Date(a.at).toISOString(), by: a.by, type: a.type, text: a.text }))}
          />
          {session.role === "admin" && <DeleteCandidate id={id} name={c.name} />}
        </div>
      </div>
    </>
  );
}
