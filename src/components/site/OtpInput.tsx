"use client";

import { useRef } from "react";

/** Six single-digit boxes; supports typing, backspace, arrow keys and pasting the whole code. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  dark = false,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  dark?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (clean.length === 6) onComplete?.(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={6}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) return;
            if (typed.length > 1) {
              // Paste or autofill of the full code
              set(typed);
              refs.current[Math.min(typed.length, 5)]?.focus();
              return;
            }
            const next = (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, 6);
            set(next);
            refs.current[Math.min(i + 1, 5)]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (d) set(value.slice(0, i) + value.slice(i + 1));
              else if (i > 0) {
                set(value.slice(0, i - 1) + value.slice(i));
                refs.current[i - 1]?.focus();
              }
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={`size-12 rounded-xl border-2 text-center font-display text-2xl font-bold outline-none transition sm:size-14 ${
            dark
              ? "border-white/20 bg-white/10 text-white focus:border-sun"
              : "border-ink/15 bg-white text-ink focus:border-ink focus:shadow-[3px_3px_0_var(--color-ink)]"
          } ${d ? (dark ? "border-sun" : "border-ink") : ""}`}
        />
      ))}
    </div>
  );
}
