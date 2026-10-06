"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, PhoneOff, Sparkles } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { WhatsAppIcon } from "./BrandIcons";

type Props = {
  jobs: { title: string; salary: string; salaryMax: number | null }[];
  stats: { value: string; label: string }[];
};

export function Hero({ jobs, stats }: Props) {
  const ticker = jobs.length ? jobs : [{ title: "Telecallers", salary: "Up to ₹18,000/month", salaryMax: 18000 }];
  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* Backdrop: dotted grid and soft colour fields */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_25%_30%,#000_15%,transparent_65%)]" />
        <div className="absolute -right-40 top-0 size-[40rem] rounded-full bg-teal/20 blur-[120px]" />
        <div className="absolute -left-40 bottom-10 size-[30rem] rounded-full bg-sun/30 blur-[120px]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:pb-24">
        {/* Copy */}
        <div className="relative z-10 animate-rise">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/80 py-1.5 pl-2 pr-4 text-[13px] font-medium text-ink/80 shadow-sm backdrop-blur">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-teal" />
            </span>
            <span>
              <b className="text-ink">{jobs.length} roles</b> hiring now · Bangalore
            </span>
          </div>

          <h1 className="mt-7 font-display text-[3.1rem] font-bold leading-[0.95] tracking-[-0.045em] text-ink sm:text-7xl lg:text-[6.1rem]">
            Your next job
            <br />
            is{" "}
            <span className="accent relative whitespace-nowrap pr-1 text-teal-deep">
              one call
              <svg viewBox="0 0 300 20" className="absolute -bottom-1 left-0 h-[0.28em] w-full text-sun" preserveAspectRatio="none" aria-hidden>
                <path d="M3 14 C 70 4, 150 4, 297 10" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            away.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
            Verified call-centre &amp; BPO jobs across Bangalore. We screen you once, match you to roles near home and
            call you back in days — <span className="font-semibold text-ink">free for candidates, always.</span>
          </p>

          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="#openings"
              className="btn-pop group inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-7 py-4 text-[15px] font-bold text-ink"
            >
              See open roles
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink("Hi KelasaHub, I want to start my career. Please share current openings.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-ink bg-white px-7 py-4 text-[15px] font-bold text-ink"
            >
              <WhatsAppIcon className="size-5 text-[#1da851]" />
              WhatsApp us
            </a>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-2 gap-y-6 sm:flex sm:justify-between">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-sun pl-3.5">
                <dt className="sr-only">{s.label}</dt>
                <dd className="whitespace-nowrap font-display text-[1.65rem] font-bold leading-none tracking-tight">{s.value}</dd>
                <dd className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Interactive phone */}
        <div className="relative mx-auto flex w-full max-w-[26rem] justify-center py-6 animate-rise [animation-delay:150ms]">
          <span className="sticker absolute -left-2 top-10 z-20 -rotate-[8deg] bg-sun text-ink sm:-left-8">₹0 fees, ever ✦</span>
          <span className="sticker absolute -right-2 top-36 z-20 rotate-[7deg] bg-teal text-white sm:-right-6">Freshers welcome</span>
          <span className="sticker absolute -left-4 bottom-24 z-20 hidden -rotate-[4deg] bg-white font-kannada text-ink sm:-left-12 sm:inline-flex">
            ಕನ್ನಡ · हिंदी · தமிழ்
          </span>
          <span className="sticker absolute -right-1 bottom-8 z-20 hidden rotate-[-6deg] bg-ink text-white sm:-right-4 sm:inline-flex">
            <Sparkles className="size-3.5 text-sun" /> Day shifts
          </span>
          <PhoneCall />
        </div>
      </div>

      {/* Role ticker */}
      <div className="relative border-y-2 border-ink bg-ink py-4 text-white">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee-slow gap-10 hover:[animation-play-state:paused]">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((j, i) => (
              <Link key={i} href="#openings" className="flex items-center gap-3 whitespace-nowrap font-display text-lg font-semibold sm:text-xl">
                <span className="text-sun">✦</span>
                {j.title}
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-medium text-teal-soft">
                  {j.salaryMax ? `₹${Math.round(j.salaryMax / 1000)}K/mo` : j.salary}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

type Stage = "ringing" | "declined" | "talking" | "offer";

const LINES = [
  { who: "hr", text: "Hi Priya! Calling from KelasaHub 👋" },
  { who: "hr", text: "You cleared the interview at Nex-Gen 🎉" },
  { who: "me", text: "Wait… really?! 😄" },
  { who: "hr", text: "Joining Monday, 10 AM. Day shift, just like you asked." },
];

/** A phone that rings; accept it to hear the call that gets you hired. Loops on its own. */
function PhoneCall() {
  const [stage, setStage] = useState<Stage>("ringing");
  const [shown, setShown] = useState(0);
  const [secs, setSecs] = useState(0);
  const touched = useRef(false);

  const accept = () => {
    setShown(0);
    setSecs(0);
    setStage("talking");
  };

  // Auto-play the story if nobody taps, and loop back afterwards.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (stage === "ringing") t = setTimeout(accept, touched.current ? 9000 : 4200);
    if (stage === "declined") t = setTimeout(() => setStage("ringing"), 2600);
    if (stage === "offer") t = setTimeout(() => setStage("ringing"), 6500);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "talking") return;
    const tick = setInterval(() => setSecs((s) => s + 1), 1000);
    let done: ReturnType<typeof setTimeout> | undefined;
    const lines = setInterval(() => {
      setShown((n) => {
        if (n >= LINES.length) {
          clearInterval(lines);
          done = setTimeout(() => setStage("offer"), 1300);
          return n;
        }
        return n + 1;
      });
    }, 1100);
    return () => {
      clearInterval(tick);
      clearInterval(lines);
      clearTimeout(done);
    };
  }, [stage]);

  return (
    <div className="relative z-10 w-[17.5rem] rotate-[3deg] rounded-[3rem] border-2 border-ink bg-ink p-2.5 shadow-[14px_14px_0_rgba(11,31,58,0.18)] transition-transform duration-500 hover:rotate-0 sm:w-[19rem]">
      <div className="relative h-[34rem] overflow-hidden rounded-[2.4rem] bg-gradient-to-b from-ink-2 via-ink to-[#071528] text-white sm:h-[37rem]">
        {/* status bar + notch */}
        <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-white/70">
          <span>9:41</span>
          <span className="h-5 w-20 rounded-full bg-black" />
          <span>5G ▮▮▮</span>
        </div>

        {(stage === "ringing" || stage === "declined") && (
          <div key="ring" className="flex h-[calc(100%-2rem)] animate-rise flex-col items-center px-6 pt-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft/80">
              {stage === "ringing" ? "Incoming call…" : "Missed call"}
            </p>
            <div className="relative mt-8 grid size-28 place-items-center">
              {stage === "ringing" && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-teal/30" />
                  <span className="absolute -inset-3 animate-ping rounded-full bg-teal/15 [animation-delay:400ms]" />
                </>
              )}
              <span className="relative grid size-28 place-items-center rounded-full bg-white">
                <Image src="/assets/kelasahub-icon.png" alt="" width={52} height={62} className="h-16 w-auto" />
              </span>
            </div>
            <p className="mt-6 font-display text-3xl font-bold">KelasaHub</p>
            <p className="mt-1 text-sm text-white/60">Bangalore · About your application</p>
            {stage === "declined" && <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm">No worries — we always call back 😉</p>}

            <div className="mb-10 mt-auto flex w-full justify-around">
              <button
                onClick={() => {
                  touched.current = true;
                  setStage("declined");
                }}
                disabled={stage !== "ringing"}
                className="flex flex-col items-center gap-2 text-xs text-white/70"
                aria-label="Decline call"
              >
                <span className="grid size-16 place-items-center rounded-full bg-[#ff4d4f] transition hover:scale-105">
                  <PhoneOff className="size-6" />
                </span>
                Decline
              </button>
              <button
                onClick={() => {
                  touched.current = true;
                  accept();
                }}
                disabled={stage !== "ringing"}
                className="flex flex-col items-center gap-2 text-xs text-white/70"
                aria-label="Accept call"
              >
                <span className={`grid size-16 place-items-center rounded-full bg-[#22c55e] transition hover:scale-105 ${stage === "ringing" ? "animate-bounce" : ""}`}>
                  <Phone className={`size-6 ${stage === "ringing" ? "animate-ring" : ""}`} />
                </span>
                Accept
              </button>
            </div>
          </div>
        )}

        {stage === "talking" && (
          <div key="talk" className="flex h-[calc(100%-2rem)] animate-rise flex-col px-4 pt-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-white">
                <Image src="/assets/kelasahub-icon.png" alt="" width={22} height={26} className="h-6 w-auto" />
              </span>
              <div>
                <p className="text-sm font-semibold">KelasaHub</p>
                <p className="font-mono text-xs text-teal-soft">00:{String(secs).padStart(2, "0")} · connected</p>
              </div>
              <span className="ml-auto flex h-6 items-end gap-[3px]" aria-hidden>
                {[0.5, 1, 0.7, 0.9, 0.4].map((h, i) => (
                  <span
                    key={i}
                    className="w-[3px] origin-bottom rounded-full bg-teal"
                    style={{ height: `${h * 100}%`, animation: `wave ${0.6 + i * 0.12}s ease-in-out infinite alternate` }}
                  />
                ))}
              </span>
            </div>
            <div className="mt-5 flex flex-1 flex-col gap-2.5">
              {LINES.slice(0, shown).map((l, i) => (
                <p
                  key={i}
                  className={`max-w-[85%] animate-pop rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                    l.who === "me" ? "ml-auto rounded-br-md bg-sun text-ink" : "rounded-bl-md bg-white text-ink"
                  }`}
                >
                  {l.text}
                </p>
              ))}
              {shown < LINES.length && (
                <span className="flex gap-1 px-2 py-2" aria-hidden>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </span>
              )}
            </div>
            <div className="mb-8 flex justify-center">
              <span className="grid size-14 place-items-center rounded-full bg-[#ff4d4f]">
                <PhoneOff className="size-5" />
              </span>
            </div>
          </div>
        )}

        {stage === "offer" && (
          <div key="offer" className="relative flex h-[calc(100%-2rem)] animate-pop flex-col items-center justify-center px-5 text-center">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="absolute rounded-sm"
                style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, height: c.s * 0.45, background: c.c, transform: `rotate(${c.r}deg)` }}
              />
            ))}
            <div className="relative w-full rounded-3xl bg-paper p-5 text-ink shadow-xl">
              <span className="sticker -rotate-3 bg-teal text-[11px] text-white">SELECTED ✓</span>
              <p className="mt-4 font-display text-2xl font-bold leading-tight">
                Welcome aboard, <span className="accent text-teal-deep">Priya!</span>
              </p>
              <dl className="mt-4 space-y-2 text-left text-[13px]">
                {[
                  ["Role", "Telecaller · Voice"],
                  ["Company", "Nex-Gen, HBR Layout"],
                  ["Salary", "₹18,000 + incentives"],
                  ["Joining", "Monday · 10:00 AM"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-dashed border-line pb-1.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] font-semibold text-teal-deep">Placement fee paid by you: ₹0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 100,
  s: 8 + ((i * 7) % 8),
  r: (i * 47) % 180,
  c: ["#f6b93b", "#14a39a", "#ffffff", "#f2795a"][i % 4],
}));
