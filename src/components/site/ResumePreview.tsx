"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACCENTS, pointsOf, type ResumeData } from "@/lib/resume";

/* --------------------------------- Preview --------------------------------- */

function H({ color, children }: { color: string; children: ReactNode }) {
  return (
    <h3 className="mb-1.5 mt-5 text-[13.3px] font-bold uppercase" style={{ color }}>
      {children}
    </h3>
  );
}
// HTML twin of lib/pdf/Resume.tsx, drawn at A4 size (794px) and scaled to fit.

/** Live HTML twin of lib/pdf/Resume.tsx, drawn at A4 size (794px) and scaled to fit its container. */
export function ResumePreview({ r }: { r: ResumeData }) {
  const box = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [height, setHeight] = useState(1123);
  useEffect(() => {
    const el = box.current;
    const page = sheet.current;
    if (!el || !page) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / 794));
      setHeight(page.offsetHeight);
    });
    ro.observe(el);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);
  const accent = ACCENTS[r.accent];
  const contact = [r.phone, r.email, r.location].filter(Boolean);
  const experience = r.experience.filter((e) => e.role || e.company);
  const education = r.education.filter((e) => e.degree || e.school);
  const certs = r.certifications.split("\n").map((l) => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);

  return (
    <div ref={box} className="overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)]">
      <div style={{ width: 794 * scale, height: height * scale }} className="relative">
        <div
          ref={sheet}
          className="absolute left-0 top-0 origin-top-left bg-white px-[61px] py-[53px] font-sans text-[13.3px] leading-[1.45] text-[#1c2b40]"
          style={{ width: 794, minHeight: 1123, transform: `scale(${scale})` }}
        >
          <p className="font-display text-[35px] font-bold leading-[1.1] text-ink">{r.name || "Your Name"}</p>
          {r.headline && (
            <p className="mt-1 text-[15px] font-semibold" style={{ color: accent }}>
              {r.headline}
            </p>
          )}
          {contact.length > 0 && <p className="mt-2 whitespace-pre-wrap text-[12.6px] text-muted">{contact.join("   ·   ")}</p>}
          <div className="mt-4 h-[2.6px]" style={{ background: accent }} />

          {r.summary && (
            <>
              <H color={accent}>Profile</H>
              <p>{r.summary}</p>
            </>
          )}
          {experience.length > 0 && (
            <>
              <H color={accent}>Experience</H>
              {experience.map((e, i) => (
                <div key={i} className={i ? "mt-3" : ""}>
                  <div className="flex justify-between gap-4">
                    <p className="text-[14px] font-bold">{e.role}</p>
                    <p className="shrink-0 text-[12.6px] text-muted">{[e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ")}</p>
                  </div>
                  <p className="text-muted">{[e.company, e.location].filter(Boolean).join(", ")}</p>
                  {pointsOf(e).map((p) => (
                    <p key={p} className="mt-0.5 flex gap-2">
                      <span style={{ color: accent }}>•</span>
                      <span>{p}</span>
                    </p>
                  ))}
                </div>
              ))}
            </>
          )}
          {education.length > 0 && (
            <>
              <H color={accent}>Education</H>
              {education.map((e, i) => (
                <div key={i} className={`flex justify-between gap-4 ${i ? "mt-2" : ""}`}>
                  <div>
                    <p className="text-[14px] font-bold">{e.degree}</p>
                    <p className="text-muted">{[e.school, e.score].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="shrink-0 text-[12.6px] text-muted">{e.year}</p>
                </div>
              ))}
            </>
          )}
          {r.skills.length > 0 && (
            <>
              <H color={accent}>Skills</H>
              <div className="flex flex-wrap gap-1.5">
                {r.skills.map((s) => (
                  <span key={s} className="rounded border border-[#dfe3ea] px-2 py-0.5 text-[12.6px]">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
          {r.languages.length > 0 && (
            <>
              <H color={accent}>Languages</H>
              <p>{r.languages.filter((l) => l.name).map((l) => `${l.name} (${l.level})`).join("   ·   ")}</p>
            </>
          )}
          {certs.length > 0 && (
            <>
              <H color={accent}>Certifications &amp; achievements</H>
              {certs.map((c) => (
                <p key={c} className="mt-0.5 flex gap-2">
                  <span style={{ color: accent }}>•</span>
                  <span>{c}</span>
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
