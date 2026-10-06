"use client";

import { useState, useTransition } from "react";
import { toggleJob } from "@/app/admin/actions";

export function JobToggle({ id, active }: { id: string; active: boolean }) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  return (
    <button
      role="switch"
      aria-checked={on}
      title={on ? "Live on website — click to hide" : "Hidden — click to publish"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOn(!on);
          const r = await toggleJob(id, !on);
          if (!r.ok) setOn(on);
        })
      }
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-teal" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
