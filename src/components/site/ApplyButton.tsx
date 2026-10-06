"use client";

import { ArrowRight } from "lucide-react";
import { useApply } from "./ApplyProvider";

export function ApplyButton({
  role,
  jobId,
  company,
  className = "",
}: {
  role: string;
  jobId: string;
  company?: string;
  className?: string;
}) {
  const { openApply } = useApply();
  return (
    <button
      onClick={() => openApply({ mode: "job", role, jobId, company })}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(11,31,58,0.6)] transition hover:-translate-y-0.5 hover:bg-ink-2 ${className}`}
    >
      Apply now — it&apos;s free <ArrowRight className="size-4 transition group-hover:translate-x-1" />
    </button>
  );
}
