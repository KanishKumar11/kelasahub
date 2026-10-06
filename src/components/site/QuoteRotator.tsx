"use client";

import { useEffect, useState } from "react";

const REVIEWS = [
  {
    quote:
      "I applied on a Tuesday evening and had a phone screen by Thursday morning. No agent asked me for a single rupee — I kept waiting for the catch.",
    initials: "RM",
    name: "Rahul M.",
    role: "Technical Support · Electronic City",
    tone: "bg-sun",
  },
  {
    quote:
      "The status tracker meant I stopped calling every two days to ask ‘any update?’ I could just check it myself, at 11pm if I wanted.",
    initials: "PN",
    name: "Priya N.",
    role: "Voice Support · BTM Layout",
    tone: "bg-teal text-white",
  },
  {
    quote:
      "I didn't get the first role, but they kept my profile active and placed me in something better two weeks later. Didn't expect that follow-through.",
    initials: "SI",
    name: "Sneha I.",
    role: "Voice Support · Marathahalli",
    tone: "bg-[#fde3da]",
  },
];

export function QuoteRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % REVIEWS.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  const r = REVIEWS[i];
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-end" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <figure key={i} className="animate-rise">
        <span aria-hidden className="block h-12 font-serif text-[8rem] leading-[0.85] text-sun">
          “
        </span>
        <blockquote className="mt-2 font-serif text-[2rem] leading-[1.15] tracking-[-0.01em] text-ink sm:text-5xl lg:text-[3.4rem]">
          {r.quote}
        </blockquote>
        <figcaption className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          {r.name} — {r.role}
        </figcaption>
      </figure>
      <div className="flex gap-3 lg:flex-col" role="tablist" aria-label="Choose a review">
        {REVIEWS.map((x, k) => (
          <button
            key={x.name}
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`flex flex-1 items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
              k === i ? "border-ink bg-white shadow-[5px_5px_0_var(--color-ink)]" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-sm font-bold ${x.tone}`}>
              {x.initials}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-sm font-bold">{x.name}</span>
              <span className="block truncate text-xs text-muted">{x.role}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
