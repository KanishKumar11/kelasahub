import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, FileDown, FileText, PartyPopper, Sparkles, XCircle } from "lucide-react";
import { getCandidateSession } from "@/lib/candidate-auth";
import { applicationsFor } from "@/lib/status";
import { getSavedResume } from "@/lib/resume-store";
import { whatsappLink } from "@/lib/constants";
import { StageProgress } from "@/components/site/StageProgress";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { SignInPanel, SignOutButton } from "./AccountClient";

export const metadata: Metadata = {
  title: "My account",
  description: "Sign in to see all your KelasaHub job applications, interview dates and your free resume.",
  robots: { index: false },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function AccountPage() {
  const session = await getCandidateSession();
  return session ? <Dashboard email={session.email} /> : <SignIn />;
}

function SignIn() {
  return (
    <section className="relative min-h-[80dvh] overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_65%)]" />
        <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-teal/20 blur-[110px]" />
        <div className="absolute -right-24 top-40 size-[22rem] rounded-full bg-sun/25 blur-[110px]" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">Candidate account</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            Your job hunt, <span className="accent text-teal-deep">in one place.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-[16px]">
            {[
              "Every application and where it stands",
              "Interview and joining dates the moment they're set",
              "Your application forms, ready to download",
              "A free resume that's saved to your account",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-white">
                  <Sparkles className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8">
          <h2 className="font-display text-2xl font-bold">Sign in</h2>
          <p className="mb-5 mt-1 text-sm text-muted">No password needed — we&apos;ll email you a code.</p>
          <SignInPanel />
        </div>
      </div>
    </section>
  );
}

async function Dashboard({ email }: { email: string }) {
  const [{ name, applications, upcomingInterviews }, resume] = await Promise.all([applicationsFor(email), getSavedResume(email)]);
  const first = (resume?.data.name || name).split(" ")[0];
  const active = applications.filter((a) => a.stage.step >= 0);

  return (
    <section className="relative overflow-hidden pb-24 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute -right-24 -top-16 -z-10 size-[28rem] rounded-full bg-teal/20 blur-[110px]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">My account</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              {first ? (
                <>
                  Hi <span className="accent text-teal-deep">{first}</span> 👋
                </>
              ) : (
                "Welcome 👋"
              )}
            </h1>
            <p className="mt-2 truncate text-sm text-muted">Signed in as {email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* At a glance */}
        <dl className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Applications", value: applications.length },
            { label: "In progress", value: active.length },
            { label: "Upcoming interviews", value: upcomingInterviews },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border-2 border-ink bg-white p-4 sm:p-5">
              <dd className="font-display text-3xl font-bold sm:text-4xl">{s.value}</dd>
              <dt className="mt-0.5 text-xs font-semibold text-muted sm:text-sm">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Applications */}
          <div>
            <h2 className="font-display text-2xl font-bold">Your applications</h2>
            {applications.length === 0 ? (
              <div className="mt-4 rounded-[2rem] border-2 border-dashed border-ink/30 p-8 text-center">
                <BriefcaseBusiness className="mx-auto size-8 text-muted" />
                <p className="mt-3 font-display text-xl font-bold">No applications with this email yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                  Applied with a different email? Sign out and use that one. Otherwise, pick a role — it takes two minutes.
                </p>
                <Link href="/jobs" className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold">
                  Browse jobs <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {applications.map((a) => {
                  const closed = a.stage.step === -1;
                  return (
                    <li key={a.candidateId} className={`overflow-hidden rounded-[1.75rem] border-2 border-ink bg-white ${closed ? "opacity-80" : "shadow-[5px_5px_0_var(--color-ink)]"}`}>
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                              {a.candidateId} · applied {fmt(a.appliedOn)}
                            </p>
                            <h3 className="mt-1 font-display text-2xl font-bold leading-tight">
                              {a.jobSlug ? (
                                <Link href={`/jobs/${a.jobSlug}`} className="hover:text-teal-deep">
                                  {a.role}
                                </Link>
                              ) : (
                                a.role
                              )}
                            </h3>
                            {a.company && <p className="text-sm text-muted">{a.company}</p>}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${closed ? "bg-paper-2 text-muted" : a.stage.step === 4 ? "bg-sun" : "bg-teal-soft text-teal-deep"}`}>
                            {a.stage.label.split(" — ")[0]}
                          </span>
                        </div>

                        {closed ? (
                          <p className="mt-4 flex items-start gap-2 text-sm text-muted">
                            <XCircle className="mt-0.5 size-4 shrink-0" /> {a.stage.label}
                          </p>
                        ) : (
                          <div className="mt-5">
                            <StageProgress step={a.stage.step} compact />
                            <p className="mt-3 text-sm font-medium text-teal-deep">{a.stage.label}</p>
                          </div>
                        )}

                        {(a.interviewDate || a.joiningDate) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {a.interviewDate && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1.5 text-sm font-semibold">
                                <CalendarDays className="size-4" /> Interview {fmt(a.interviewDate)}
                              </span>
                            )}
                            {a.joiningDate && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-sm font-semibold text-teal-deep">
                                <PartyPopper className="size-4" /> Joining {fmt(a.joiningDate)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink/10 bg-paper/60 px-5 py-3 sm:px-6">
                        <a href={a.pdfUrl} download className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-ink/5">
                          <FileDown className="size-4" /> Application form
                        </a>
                        <a
                          href={whatsappLink(`Hi KelasaHub, I'd like an update on my application ${a.candidateId} (${a.role}).`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-ink/5"
                        >
                          <WhatsAppIcon className="size-4 text-[#25D366]" /> Ask for an update
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:pt-12">
            <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-ink bg-ink p-6 text-white">
              <div className="bg-grid-dark absolute inset-0 opacity-50" />
              <div className="relative">
                <FileText className="size-7 text-sun" />
                <p className="mt-3 font-display text-2xl font-bold leading-tight">
                  {resume ? "Your resume" : <>Build your resume — <span className="accent text-sun">free.</span></>}
                </p>
                <p className="mt-1.5 text-sm text-white/70">
                  {resume
                    ? `Last saved ${fmt(resume.updatedAt)}. Our recruiters can see it when they match you to roles.`
                    : "A clean, job-ready PDF in ten minutes, with ready-made lines for BPO roles."}
                </p>
                <Link href="/resume-builder" className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink">
                  {resume ? "Edit my resume" : "Start my resume"} <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <Link href="/jobs" className="group flex items-center justify-between rounded-[1.75rem] border-2 border-ink bg-sun p-6 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]">
              <span>
                <span className="block font-display text-xl font-bold">Apply for more roles</span>
                <span className="text-sm text-ink/70">New openings every week</span>
              </span>
              <ArrowUpRight className="size-6 transition group-hover:rotate-45" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
