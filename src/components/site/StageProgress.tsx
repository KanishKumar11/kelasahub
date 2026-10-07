import { Check } from "lucide-react";

export const STAGES = ["Applied", "In review", "Shortlisted", "Interview", "Selected"];

/** Five-step application tracker; `step` comes from publicStage() (-1 = closed, not shown). */
export function StageProgress({ step, compact = false }: { step: number; compact?: boolean }) {
  return (
    <ol className={`grid grid-cols-5 ${compact ? "gap-1" : "gap-1.5"}`}>
      {STAGES.map((s, i) => {
        const done = i <= step;
        return (
          <li key={s} className="flex flex-col items-center gap-2 text-center">
            <span className={`w-full rounded-full ${compact ? "h-1.5" : "h-2"} ${done ? "bg-teal" : "bg-paper-2"}`} />
            {!compact && (
              <span className={`grid size-8 place-items-center rounded-full ${done ? "bg-teal text-white" : "bg-paper-2 text-muted"}`}>
                {done ? <Check className="size-4" strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </span>
            )}
            <span className={`font-medium leading-tight ${compact ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs"} ${done ? "text-ink" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
