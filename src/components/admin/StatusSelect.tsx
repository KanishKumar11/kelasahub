"use client";

import { useState, useTransition } from "react";
import { setCandidateField } from "@/app/admin/actions";
import { toneFor } from "./ui";

type Field = Parameters<typeof setCandidateField>[1];

/** Pill-styled dropdown that saves on change (optimistic). */
export function StatusSelect({
  id,
  field,
  value,
  options,
  allowEmpty = false,
  size = "sm",
}: {
  id: string;
  field: Field;
  value: string;
  options: readonly string[];
  allowEmpty?: boolean;
  size?: "sm" | "md";
}) {
  const [v, setV] = useState(value);
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <span className="relative inline-block">
      <select
        value={v}
        disabled={pending}
        title={err || undefined}
        onChange={(e) => {
          const next = e.target.value;
          const prev = v;
          setV(next);
          setErr("");
          start(async () => {
            const r = await setCandidateField(id, field, next);
            if (!r.ok) {
              setV(prev);
              setErr(r.error);
            }
          });
        }}
        className={`cursor-pointer appearance-none rounded-full font-semibold ring-1 ring-inset outline-none transition focus:ring-2 focus:ring-teal disabled:opacity-60 ${
          size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
        } ${v ? toneFor(v) : "bg-white text-slate-400 ring-black/10"} ${err ? "ring-2 ring-rose-500" : ""}`}
      >
        {(allowEmpty || !v) && <option value="">—</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </span>
  );
}
