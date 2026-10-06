"use client";

import { useEffect, useRef, useState } from "react";

// Words light up one by one as the paragraph scrolls through the viewport.
// Segments marked `hi` render as teal italic accents.
const TEXT: { t: string; hi?: boolean }[] = [
  { t: "KelasaHub is paid by the companies that hire, " },
  { t: "never by you.", hi: true },
  { t: " We screen your profile once, match you to roles " },
  { t: "near home,", hi: true },
  { t: " call you back " },
  { t: "in days,", hi: true },
  { t: " not weeks — and we still check in " },
  { t: "a month after you join.", hi: true },
];

const WORDS = TEXT.flatMap((seg) =>
  seg.t
    .split(/(\s+)/)
    .filter((w) => w.length)
    .map((w) => ({ w, hi: !!seg.hi })),
);
const COUNT = WORDS.filter((x) => x.w.trim()).length;

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduced) return setLit(COUNT);
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.82 - r.top) / (r.height + vh * 0.25);
      setLit(Math.round(Math.min(1, Math.max(0, progress)) * COUNT));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  let i = 0;
  return (
    <p ref={ref} className="mt-8 font-display text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
      {WORDS.map((x, k) => {
        if (!x.w.trim()) return x.w;
        const on = i++ < lit;
        return (
          <span
            key={k}
            className={`transition-colors duration-300 ${x.hi ? "accent font-normal" : ""} ${
              on ? (x.hi ? "text-teal-deep" : "text-ink") : "text-ink/15"
            }`}
          >
            {x.w}
          </span>
        );
      })}
    </p>
  );
}
