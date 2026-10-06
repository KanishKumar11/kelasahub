"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, ImageIcon, Search, X } from "lucide-react";
import type { PublicJob } from "@/lib/queries";
import { HIRING_STATS, PROCESSES, SHIFT_TIMINGS } from "@/lib/constants";
import { useApply } from "./ApplyProvider";
import { Reveal } from "./Reveal";

const FILTERS = [
  { key: "all", label: "All roles" },
  { key: "fresher", label: "Freshers welcome" },
  { key: "senior", label: "₹30K+ / month" },
] as const;

export function Openings({ jobs }: { jobs: PublicJob[] }) {
  const { openApply, openTalentPool } = useApply();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [poster, setPoster] = useState<PublicJob | null>(null);
  const [hover, setHover] = useState<PublicJob | null>(null);
  const follower = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter === "fresher" && !j.freshersOk) return false;
      if (filter === "senior" && !((j.salaryMax ?? 0) >= 30000)) return false;
      if (term && !`${j.title} ${j.description} ${j.requirements}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [jobs, filter, q]);

  const apply = (job: PublicJob) =>
    openApply({ mode: "job", role: job.title, jobId: job.id, company: job.company ? `${job.company} · ${job.location}` : job.location });

  return (
    <section id="openings" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">
              <span className="h-px w-8 bg-teal-deep" /> {HIRING_STATS.openPositions} openings · {jobs.length} job types
            </p>
            <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              Pick your <span className="accent text-teal-deep">seat.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted">Every role is verified, salaried and hiring this month. Tap one to apply in two minutes.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 overflow-x-auto rounded-full border-2 border-ink bg-white p-1 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                    filter === f.key ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles"
                className="w-full rounded-full border-2 border-ink bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:ring-4 focus:ring-sun/50 sm:w-48"
              />
            </label>
          </div>
        </Reveal>

        {/* Editorial job list */}
        <div
          className="relative mt-12 border-b-2 border-ink"
          onMouseMove={(e) => {
            const el = follower.current;
            if (el) el.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 120}px) rotate(4deg)`;
          }}
          onMouseLeave={() => setHover(null)}
        >
          {shown.map((job, idx) => (
            <JobRow key={job.id} job={job} index={idx} onApply={() => apply(job)} onPoster={() => setPoster(job)} onHover={setHover} />
          ))}
          {shown.length === 0 && <p className="border-t-2 border-ink py-12 text-center text-muted">No roles match that filter — try “All roles”.</p>}

          {/* Poster that follows the cursor (desktop only) */}
          <div
            ref={follower}
            aria-hidden
            className={`pointer-events-none fixed left-0 top-0 z-30 hidden w-60 overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] transition-opacity duration-200 [@media(pointer:fine)]:block ${
              hover?.image ? "opacity-100" : "opacity-0"
            }`}
          >
            {hover?.image && <Image src={hover.image} alt="" width={480} height={480} className="h-auto w-full" />}
          </div>
        </div>

        {/* Talent pool + employer details */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <Reveal>
            <button
              onClick={openTalentPool}
              className="group flex h-full w-full flex-col justify-between rounded-[2rem] border-2 border-dashed border-ink/30 p-7 text-left transition hover:border-ink hover:bg-white"
            >
              <span className="font-display text-3xl font-bold leading-tight tracking-tight">
                Don&apos;t see <span className="accent">your</span> role?
              </span>
              <span className="mt-3 block text-[15px] text-muted">
                Join the talent pool once — we&apos;ll match you to voice, chat, back-office and language roles as they open.
              </span>
              <span className="btn-pop mt-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink">
                Join the talent pool <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </button>
          </Reveal>
          <Reveal delay={80}>
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-teal p-7 text-white">
              <div className="bg-grid-dark absolute inset-0 opacity-70" />
              <div className="relative">
                <p className="font-display text-2xl font-bold sm:text-3xl">
                  Most roles are at <span className="accent">Nex-Gen,</span> HBR Layout
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PROCESSES.map((p) => (
                    <span key={p.label} className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-medium">
                      {p.emoji} {p.label}
                    </span>
                  ))}
                </div>
                <p className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sun-soft">
                  <Clock className="size-3.5" /> Choose your shift
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SHIFT_TIMINGS.map((s) => (
                    <span
                      key={s}
                      className="relative rounded-xl bg-white px-2 py-3 text-center text-[13px] font-bold text-ink [mask:radial-gradient(circle_6px_at_0_50%,#0000_98%,#000)_left/51%_100%_no-repeat,radial-gradient(circle_6px_at_100%_50%,#0000_98%,#000)_right/51%_100%_no-repeat]"
                    >
                      {s.replace(" – ", "–")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {poster && <PosterDialog job={poster} onClose={() => setPoster(null)} />}
    </section>
  );
}

function JobRow({
  job,
  index,
  onApply,
  onPoster,
  onHover,
}: {
  job: PublicJob;
  index: number;
  onApply: () => void;
  onPoster: () => void;
  onHover: (j: PublicJob | null) => void;
}) {
  const k = job.salaryMax ? `₹${Math.round(job.salaryMax / 1000)}K` : null;
  return (
    <article
      onMouseEnter={() => onHover(job)}
      className="group relative isolate border-t-2 border-ink"
    >
      {/* marigold sweep */}
      <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-sun transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-x-100" />
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 px-1 py-6 sm:gap-x-8 sm:px-3 sm:py-8 lg:grid-cols-[3rem_1.6fr_1fr_auto_auto]">
        <span className="self-start pt-2 font-mono text-sm font-bold text-ink/40 lg:self-center lg:pt-0">{String(index + 1).padStart(2, "0")}</span>

        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold leading-[1.05] tracking-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">
            <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0">
              {job.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-1 max-w-xl text-[15px] text-muted group-hover:text-ink/75">{job.description}</p>
        </div>

        <div className="col-span-3 col-start-2 flex flex-wrap gap-1.5 lg:col-span-1 lg:col-start-auto">
          {job.freshersOk && <span className="rounded-full border-[1.5px] border-ink bg-white px-2.5 py-1 text-xs font-bold">Freshers OK</span>}
          <span className="rounded-full border-[1.5px] border-ink/25 px-2.5 py-1 text-xs font-semibold text-ink/70 group-hover:border-ink">
            {job.location.split(",")[0]}
          </span>
        </div>

        <div className="col-start-2 row-start-3 lg:col-start-auto lg:row-start-auto lg:text-right">
          {k ? (
            <>
              <p className="font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">{k}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-ink/70">
                {/^up to/i.test(job.salary) ? "up to / month" : "per month"}
              </p>
            </>
          ) : (
            <p className="font-semibold">{job.salary}</p>
          )}
        </div>

        <div className="relative z-10 col-start-3 row-span-1 row-start-1 flex items-center gap-2 self-start lg:col-start-auto lg:row-start-auto lg:self-center">
          {job.image && (
            <button
              onClick={onPoster}
              aria-label={`View ${job.title} poster`}
              className="grid size-11 place-items-center rounded-full border-2 border-ink bg-white transition hover:bg-ink hover:text-white [@media(pointer:fine)]:hidden"
            >
              <ImageIcon className="size-4" />
            </button>
          )}
          <button
            onClick={onApply}
            className="btn-pop hidden items-center gap-2 rounded-full border-2 border-ink bg-white px-5 py-3 text-sm font-bold sm:inline-flex"
          >
            Apply <ArrowUpRight className="size-4" />
          </button>
          <button onClick={onApply} aria-label={`Apply for ${job.title}`} className="grid size-11 place-items-center rounded-full border-2 border-ink bg-ink text-white sm:hidden">
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function PosterDialog({ job, onClose }: { job: PublicJob; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(100%-1.5rem,40rem)] overflow-visible bg-transparent p-0 backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-pop"
    >
      <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-white">
        <Image src={job.image} alt={`${job.title} hiring poster`} width={1080} height={1080} className="h-auto w-full" />
        <button
          onClick={() => ref.current?.close()}
          aria-label="Close poster"
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-ink/80 text-white backdrop-blur transition hover:bg-ink"
        >
          <X className="size-5" />
        </button>
      </div>
    </dialog>
  );
}
