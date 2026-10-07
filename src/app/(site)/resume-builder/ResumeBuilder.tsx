"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, BriefcaseBusiness, Check, Cloud, Download, Eye, Loader2, Pencil, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import {
  ACCENTS,
  LANGUAGE_LEVELS,
  POINT_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  SUMMARY_TEMPLATES,
  emptyEducation,
  emptyExperience,
  emptyResume,
  pointsOf,
  resumeSchema,
  type Accent,
  type ResumeData,
} from "@/lib/resume";
import { CandidateSignIn } from "@/components/site/CandidateSignIn";
import { ResumePreview } from "@/components/site/ResumePreview";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

const DRAFT_KEY = "kh_resume_draft";
const SHARE_TEXT = "I made my resume for free on KelasaHub — takes 10 minutes and you get a clean PDF: https://kelasahub.in/resume-builder";

export type BuilderJob = { id: string; title: string };
export type BuilderExample = { slug: string; role: string; resume: ResumeData };

const hasContent = (r: ResumeData | null | undefined) => !!r && !!(r.name || r.summary || r.experience.some((e) => e.role || e.company));
const QUICK_LANGUAGES = ["English", "Kannada", "Hindi", "Tamil", "Telugu", "Malayalam", "Urdu"];

function readDraft(): ResumeData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const parsed = raw ? resumeSchema.safeParse(JSON.parse(raw)) : null;
    return parsed?.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Drops half-filled rows (e.g. a language with no name) that would fail validation. */
const clean = (r: ResumeData): ResumeData => ({
  ...r,
  skills: r.skills.filter((x) => x.trim()),
  languages: r.languages.filter((l) => l.name.trim()),
});

/** How complete the resume is, with the next thing worth adding. */
function strength(r: ResumeData) {
  const checks: [boolean, string][] = [
    [!!r.name && !!r.phone && !!r.email, "Add your name, phone and email"],
    [!!r.headline, "Add a one-line headline"],
    [r.summary.length >= 80, "Write a short profile summary"],
    [r.education.some((e) => e.degree), "Add your education"],
    [r.skills.length >= 4, "Add at least 4 skills"],
    [r.languages.length >= 2, "Add the languages you speak"],
    [r.experience.some((e) => (e.role || e.company) && pointsOf(e).length > 0), "Add experience with a few achievements (internships count)"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return { pct: Math.round((done / checks.length) * 100), next: checks.find(([ok]) => !ok)?.[1] };
}

export default function ResumeBuilder({
  signedIn,
  initial,
  example,
  jobs,
}: {
  signedIn: boolean;
  initial: { data: ResumeData; saved: boolean } | null;
  example: BuilderExample | null;
  jobs: BuilderJob[];
}) {
  const router = useRouter();
  // Saved in the account wins; otherwise a draft from this device; otherwise the server's starting draft.
  const [existing] = useState(() => (initial?.saved ? initial.data : readDraft()));
  // An example chosen on an example page loads straight away — unless it would replace real work, then we ask.
  const [pendingExample, setPendingExample] = useState(() => (example && hasContent(existing) ? example : null));
  const [r, setR] = useState<ResumeData>(() => {
    if (example && !hasContent(existing)) return { ...example.resume, email: initial?.data.email || example.resume.email };
    return existing ?? initial?.data ?? emptyResume();
  });
  const [downloaded, setDownloaded] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchedId, setMatchedId] = useState<string | null>(null);
  const skipSave = useRef(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">(initial?.saved ? "saved" : "idle");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [signInOpen, setSignInOpen] = useState(false);
  const first = useRef(true);

  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setR((p) => ({ ...p, [k]: v }));

  async function saveNow(data: ResumeData) {
    setSave("saving");
    try {
      const res = await fetch("/api/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(data)) });
      setSave(res.ok ? "saved" : "error");
    } catch {
      setSave("error");
    }
  }

  // Keep a copy on this device always; signed-in candidates also autosave to their account.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(r));
    } catch {}
    if (first.current || skipSave.current) {
      first.current = false;
      skipSave.current = false;
      return;
    }
    if (!signedIn) return;
    const t = setTimeout(() => saveNow(r), 1200);
    return () => clearTimeout(t);
  }, [r, signedIn]);

  async function download() {
    setDownloading(true);
    setError("");
    try {
      const res = await fetch("/api/resume/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(r)) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(r.name || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDownloaded(true);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function startOver() {
    const msg = signedIn
      ? "Start over? This clears the form and deletes the resume saved in your account."
      : "Start over? This clears everything you've typed.";
    if (!window.confirm(msg)) return;
    if (signedIn) {
      const res = await fetch("/api/resume", { method: "DELETE" });
      if (!res.ok) return setError("Couldn't delete your saved resume. Please try again.");
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    skipSave.current = true;
    setR(emptyResume({ email: signedIn ? r.email : "" }));
    setSave("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const st = strength(r);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-24">
      {/* Toolbar */}
      <div className="sticky top-[5.25rem] z-30 mb-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0">
            <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" className="stroke-paper-2" />
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-teal transition-all duration-500" strokeDasharray={`${(st.pct / 100) * 94.2} 94.2`} />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[11px] font-bold">{st.pct}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold">Resume strength</p>
            <p className="truncate text-xs text-muted">{st.next ?? "Looking great — download it!"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SaveState signedIn={signedIn} state={save} onSignIn={() => setSignInOpen(true)} />
          <button
            onClick={download}
            disabled={downloading}
            className="btn-pop hidden items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-60 lg:inline-flex"
          >
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download PDF
          </button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#b9472b]">{error}</p>}

      {pendingExample && (
        <div className="mb-6 flex animate-pop flex-col gap-3 rounded-2xl border-2 border-ink bg-sun-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm">
            <span className="font-bold">Load the {pendingExample.role} example?</span> It will replace the resume you&apos;re working on.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => {
                setR({ ...pendingExample.resume, email: r.email || pendingExample.resume.email });
                setPendingExample(null);
                router.replace("/resume-builder", { scroll: false });
              }}
              className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
            >
              Load example
            </button>
            <button
              onClick={() => {
                setPendingExample(null);
                router.replace("/resume-builder", { scroll: false });
              }}
              className="rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold"
            >
              Keep mine
            </button>
          </div>
        </div>
      )}

      {downloaded && (
        <div className="relative mb-6 animate-pop overflow-hidden rounded-[1.75rem] border-2 border-ink bg-ink p-5 text-white shadow-[6px_6px_0_var(--color-teal)] sm:p-6">
          <div className="bg-grid-dark absolute inset-0 opacity-50" />
          <button onClick={() => setDownloaded(false)} aria-label="Close" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="pr-8">
              <p className="font-display text-2xl font-bold">
                {matchedId ? "You're on our list 🎉" : <>Resume downloaded 🎉 Now let&apos;s get you <span className="accent text-sun">hired.</span></>}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {matchedId
                  ? `Candidate ID ${matchedId} — our team will call you about matching roles.`
                  : "Share it with our recruiters and we'll match you to verified BPO roles — free, always."}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {!matchedId && (
                <button onClick={() => setMatchOpen(true)} className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink">
                  <BriefcaseBusiness className="size-4" /> Get matched to jobs
                </button>
              )}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                <WhatsAppIcon className="size-4" /> Share with a friend
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Editor */}
        <div className={`space-y-5 ${tab === "edit" ? "" : "hidden lg:block"}`}>
          <Card title="Look" hint="Pick an accent colour — the layout stays clean and ATS-friendly.">
            <div className="flex gap-3">
              {(Object.keys(ACCENTS) as Accent[]).map((a) => (
                <button
                  key={a}
                  onClick={() => set("accent", a)}
                  aria-label={`${a} accent`}
                  aria-pressed={r.accent === a}
                  className={`grid size-10 place-items-center rounded-full border-2 transition ${r.accent === a ? "scale-110 border-ink" : "border-transparent"}`}
                  style={{ background: ACCENTS[a] }}
                >
                  {r.accent === a && <Check className="size-4 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Card>

          <Card title="About you">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full name" value={r.name} onChange={(v) => set("name", v)} placeholder="Priya Sharma" autoComplete="name" />
              <Input label="Headline" value={r.headline} onChange={(v) => set("headline", v)} placeholder="Customer Support Executive" />
              <Input label="Phone" value={r.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
              <Input label="Email" value={r.email} onChange={(v) => set("email", v)} placeholder="you@example.com" type="email" autoComplete="email" />
              <div className="sm:col-span-2">
                <Input label="Location" value={r.location} onChange={(v) => set("location", v)} placeholder="KR Puram, Bengaluru" />
              </div>
            </div>
          </Card>

          <Card title="Profile summary" hint="Two or three lines on who you are and what you're great at.">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUMMARY_TEMPLATES.map((t) => (
                <Suggest key={t.label} onClick={() => set("summary", t.text)}>
                  <Sparkles className="size-3" /> {t.label}
                </Suggest>
              ))}
            </div>
            <TextArea value={r.summary} onChange={(v) => set("summary", v)} rows={4} max={800} placeholder="Tap a starter above, then make it yours." />
          </Card>

          <Card title="Experience" hint="Fresher? Add internships, part-time work or college projects — or skip this.">
            <div className="space-y-4">
              {r.experience.map((e, i) => {
                const upd = (patch: Partial<typeof e>) => set("experience", r.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <div key={i} className="rounded-2xl border-2 border-ink/15 bg-paper/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Job {i + 1}</p>
                      <RowTools
                        canUp={i > 0}
                        canDown={i < r.experience.length - 1}
                        onMove={(d) => set("experience", move(r.experience, i, d))}
                        onRemove={() => set("experience", r.experience.filter((_, j) => j !== i))}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Job title" value={e.role} onChange={(v) => upd({ role: v })} placeholder="Telecaller" />
                      <Input label="Company" value={e.company} onChange={(v) => upd({ company: v })} placeholder="ABC Services" />
                      <Input label="From" value={e.start} onChange={(v) => upd({ start: v })} placeholder="Jan 2024" />
                      <div>
                        <Input label="To" value={e.current ? "Present" : e.end} onChange={(v) => upd({ end: v })} placeholder="Mar 2025" disabled={e.current} />
                        <label className="mt-1.5 flex items-center gap-2 text-xs font-medium text-muted">
                          <input type="checkbox" checked={e.current} onChange={(ev) => upd({ current: ev.target.checked })} className="accent-teal" /> I work here now
                        </label>
                      </div>
                    </div>
                    <p className="mb-1.5 mt-4 text-sm font-semibold">What you did — one point per line</p>
                    <TextArea value={e.points} onChange={(v) => upd({ points: v })} rows={4} max={1200} placeholder={"Handled 80+ calls a day\nMet monthly targets"} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {POINT_SUGGESTIONS.filter((p) => !e.points.includes(p)).slice(0, 4).map((p) => (
                        <Suggest key={p} onClick={() => upd({ points: e.points.trim() ? `${e.points.trim()}\n${p}` : p })}>
                          <Plus className="size-3" /> {p}
                        </Suggest>
                      ))}
                    </div>
                  </div>
                );
              })}
              {r.experience.length < 8 && <AddButton onClick={() => set("experience", [...r.experience, emptyExperience()])}>Add experience</AddButton>}
            </div>
          </Card>

          <Card title="Education">
            <div className="space-y-4">
              {r.education.map((e, i) => {
                const upd = (patch: Partial<typeof e>) => set("education", r.education.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <div key={i} className="rounded-2xl border-2 border-ink/15 bg-paper/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Qualification {i + 1}</p>
                      <RowTools
                        canUp={i > 0}
                        canDown={i < r.education.length - 1}
                        onMove={(d) => set("education", move(r.education, i, d))}
                        onRemove={() => set("education", r.education.filter((_, j) => j !== i))}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Degree / course" value={e.degree} onChange={(v) => upd({ degree: v })} placeholder="B.Com" />
                      <Input label="College / school" value={e.school} onChange={(v) => upd({ school: v })} placeholder="Bangalore University" />
                      <Input label="Year" value={e.year} onChange={(v) => upd({ year: v })} placeholder="2024" />
                      <Input label="Score (optional)" value={e.score} onChange={(v) => upd({ score: v })} placeholder="72%" />
                    </div>
                  </div>
                );
              })}
              {r.education.length < 6 && <AddButton onClick={() => set("education", [...r.education, emptyEducation()])}>Add qualification</AddButton>}
            </div>
          </Card>

          <Card title="Skills" hint="Pick from common call-centre skills or type your own.">
            <ChipInput values={r.skills} max={20} onChange={(v) => set("skills", v)} placeholder="Type a skill and press Enter" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !r.skills.includes(s)).map((s) => (
                <Suggest key={s} onClick={() => r.skills.length < 20 && set("skills", [...r.skills, s])}>
                  <Plus className="size-3" /> {s}
                </Suggest>
              ))}
            </div>
          </Card>

          <Card title="Languages" hint="Languages are gold in BPO hiring — list every one you speak.">
            <div className="space-y-2">
              {r.languages.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={l.name}
                    onChange={(e) => set("languages", r.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    className={`${field} min-w-0 flex-1`}
                    aria-label="Language"
                    placeholder="Language"
                  />
                  <select
                    value={l.level}
                    onChange={(e) => set("languages", r.languages.map((x, j) => (j === i ? { ...x, level: e.target.value as (typeof LANGUAGE_LEVELS)[number] } : x)))}
                    className={`${field} w-36 shrink-0 sm:w-40`}
                    aria-label="Level"
                  >
                    {LANGUAGE_LEVELS.map((lv) => (
                      <option key={lv}>{lv}</option>
                    ))}
                  </select>
                  <button onClick={() => set("languages", r.languages.filter((_, j) => j !== i))} aria-label="Remove language" className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-ink/5 hover:text-ink">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_LANGUAGES.filter((q) => !r.languages.some((l) => l.name.toLowerCase() === q.toLowerCase())).map((q) => (
                <Suggest key={q} onClick={() => r.languages.length < 10 && set("languages", [...r.languages, { name: q, level: "Fluent" }])}>
                  <Plus className="size-3" /> {q}
                </Suggest>
              ))}
              {r.languages.length < 10 && (
                <Suggest onClick={() => set("languages", [...r.languages, { name: "", level: "Fluent" }])}>
                  <Plus className="size-3" /> Other
                </Suggest>
              )}
            </div>
          </Card>

          <Card title="Certifications & achievements" hint="Optional — one per line. Typing certificates, awards, NCC, sports…">
            <TextArea value={r.certifications} onChange={(v) => set("certifications", v)} rows={3} max={600} placeholder={"Typing certificate — 40 WPM\nEmployee of the month, Mar 2025"} />
          </Card>

          <div className="flex flex-col gap-3 rounded-[1.75rem] border-2 border-dashed border-ink/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-bold">Want us to find you a job?</p>
              <p className="text-sm text-muted">Send this resume to our recruiters — free, and only if you want to.</p>
            </div>
            <button
              onClick={() => setMatchOpen(true)}
              disabled={!!matchedId}
              className="btn-pop inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
            >
              {matchedId ? (
                <>
                  <Check className="size-4" /> Matched
                </>
              ) : (
                <>
                  Get matched <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
          <button onClick={startOver} className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-muted transition hover:text-[#b9472b]">
            <RotateCcw className="size-3.5" /> {signedIn ? "Start over & delete my saved resume" : "Start over"}
          </button>
        </div>

        {/* Preview */}
        <div className={tab === "preview" ? "" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-44">
            <ResumePreview r={r} />
            <p className="mt-3 text-center text-xs text-muted">Live preview · the PDF uses the same layout on A4</p>
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div data-bottom-bar className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border-2 border-ink bg-white p-2 shadow-[0_10px_30px_-10px_rgba(11,31,58,0.4)] lg:hidden">
        <button onClick={() => setTab(tab === "edit" ? "preview" : "edit")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper px-4 py-3 text-sm font-bold">
          {tab === "edit" ? <Eye className="size-4" /> : <Pencil className="size-4" />} {tab === "edit" ? "Preview" : "Edit"}
        </button>
        <button onClick={download} disabled={downloading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-sun px-4 py-3 text-sm font-bold disabled:opacity-60">
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download
        </button>
      </div>

      {matchOpen && (
        <MatchDialog
          signedIn={signedIn}
          resume={r}
          jobs={jobs}
          onClose={() => setMatchOpen(false)}
          onSignedIn={async () => {
            await saveNow(r);
            router.refresh();
          }}
          onMatched={(id) => {
            setMatchedId(id);
            setSave("saved");
          }}
        />
      )}

      {signInOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => setSignInOpen(false)}>
          <div className="w-full max-w-md animate-pop rounded-[2rem] border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Save to your account</h2>
                <p className="mt-1 text-sm text-muted">Edit it from any phone, and let our recruiters see it when matching you to roles.</p>
              </div>
              <button onClick={() => setSignInOpen(false)} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-ink/5">
                <X className="size-4" />
              </button>
            </div>
            <CandidateSignIn
              initialEmail={r.email}
              onSignedIn={async () => {
                await saveNow(r);
                setSignInOpen(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Pieces ---------------------------------- */

const field =
  "rounded-xl border-2 border-ink/15 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-ink focus:ring-4 focus:ring-sun/40 disabled:bg-paper disabled:text-muted";

function move<T>(list: T[], i: number, d: -1 | 1) {
  const next = [...list];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border-2 border-ink bg-white p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Input({ label, onChange, ...rest }: { label: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input {...rest} onChange={(e) => onChange(e.target.value)} className={`${field} w-full`} />
    </label>
  );
}

function TextArea({ value, onChange, rows, max, placeholder }: { value: string; onChange: (v: string) => void; rows: number; max: number; placeholder?: string }) {
  return (
    <div>
      <textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, max))} rows={rows} placeholder={placeholder} className={`${field} w-full resize-y leading-relaxed`} />
      <p className="mt-1 text-right text-[11px] text-muted">
        {value.length}/{max}
      </p>
    </div>
  );
}

function Suggest({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded-full border border-ink/20 bg-paper px-2.5 py-1 text-left text-xs font-semibold text-ink/80 transition hover:border-ink hover:bg-sun-soft">
      {children}
    </button>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 py-3 text-sm font-bold text-ink/70 transition hover:border-ink hover:text-ink">
      <Plus className="size-4" /> {children}
    </button>
  );
}

function RowTools({ canUp, canDown, onMove, onRemove }: { canUp: boolean; canDown: boolean; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  const b = "grid size-8 place-items-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-30";
  return (
    <div className="flex items-center gap-0.5">
      <button disabled={!canUp} onClick={() => onMove(-1)} aria-label="Move up" className={b}>
        <ArrowUp className="size-4" />
      </button>
      <button disabled={!canDown} onClick={() => onMove(1)} aria-label="Move down" className={b}>
        <ArrowDown className="size-4" />
      </button>
      <button onClick={onRemove} aria-label="Remove" className={`${b} hover:text-[#b9472b]`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function ChipInput({ values, onChange, max, placeholder }: { values: string[]; onChange: (v: string[]) => void; max: number; placeholder: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim().slice(0, 40);
    if (t && !values.includes(t) && values.length < max) onChange([...values, t]);
    setText("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-ink/15 bg-white p-2 focus-within:border-ink">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
          {v}
          <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="opacity-70 hover:opacity-100">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={add}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-[15px] outline-none"
      />
    </div>
  );
}

function SaveState({ signedIn, state, onSignIn }: { signedIn: boolean; state: "idle" | "saving" | "saved" | "error"; onSignIn: () => void }) {
  if (!signedIn)
    return (
      <button onClick={onSignIn} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold transition hover:bg-ink hover:text-white">
        <Cloud className="size-4" /> <span className="hidden sm:inline">Save to account</span>
        <span className="sm:hidden">Save</span>
      </button>
    );
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 text-xs font-semibold ${state === "error" ? "text-[#b9472b]" : "text-muted"}`}>
      {state === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : state === "error" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
      {state === "saving" ? "Saving…" : state === "error" ? "Not saved — retrying on next edit" : state === "saved" ? "Saved" : "Autosave on"}
    </span>
  );
}

/* ------------------------------ Get matched -------------------------------- */
// Opt-in: sends the resume to KelasaHub's recruiters as a new candidate (source "Resume Builder").

function MatchDialog({
  signedIn,
  resume,
  jobs,
  onClose,
  onSignedIn,
  onMatched,
}: {
  signedIn: boolean;
  resume: ResumeData;
  jobs: BuilderJob[];
  onClose: () => void;
  onSignedIn: () => Promise<void>;
  onMatched: (candidateId: string) => void;
}) {
  const [job, setJob] = useState("");
  const [phone, setPhone] = useState(resume.phone);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const role = jobs.find((j) => j.id === job)?.title ?? "Any suitable role";
      const res = await fetch("/api/resume/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: clean(resume), phone, role, jobId: job || null, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(data.candidateId);
      onMatched(data.candidateId);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-pop rounded-[2rem] border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">{done ? "You're in! 🎉" : "Get matched to jobs"}</h2>
            {!done && <p className="mt-1 text-sm text-muted">Our recruiters will call you about verified roles that fit. Free — always.</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-ink/5">
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div>
            <p className="rounded-2xl bg-paper px-4 py-3 text-sm">
              Your Candidate ID is <span className="font-bold">{done}</span>. We usually call back within a day — keep your phone handy.
            </p>
            <Link href="/account" className="btn-pop mt-5 flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink">
              Go to my account <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : !signedIn ? (
          <>
            <p className="mb-4 rounded-2xl bg-paper px-4 py-3 text-sm">First, confirm your email so we can reach you and you can track your status.</p>
            <CandidateSignIn initialEmail={resume.email} onSignedIn={onSignedIn} />
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">What kind of role do you want?</span>
              <select value={job} onChange={(e) => setJob(e.target.value)} className={`${field} w-full`}>
                <option value="">Any suitable role</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Mobile number" value={phone} onChange={setPhone} placeholder="98765 43210" inputMode="tel" autoComplete="tel" required />
            <label className="flex items-start gap-2.5 text-sm leading-relaxed">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-teal" required />
              <span>
                I agree that KelasaHub can contact me and share my resume with hiring partners, as described in the{" "}
                <a href="/privacy" target="_blank" className="font-semibold underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#b9472b]">{error}</p>}
            <button disabled={busy || !consent} className="btn-pop inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <BriefcaseBusiness className="size-4" />} Send my resume to recruiters
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
