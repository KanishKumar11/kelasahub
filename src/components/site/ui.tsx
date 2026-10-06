"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/15";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

const CHEVRON = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235b6b7f' stroke-width='2.5'><path d='m6 9 6 6 6-6'/></svg>")`;

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ backgroundImage: CHEVRON, ...props.style }}
      className={`${control} appearance-none bg-[length:14px] bg-[right_14px_center] bg-no-repeat pr-10 ${props.className ?? ""}`}
    />
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-ink bg-ink text-white shadow-sm"
          : "border-line bg-white text-ink/80 hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
}
