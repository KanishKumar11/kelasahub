"use client";

import { useState, useTransition } from "react";
import { ArrowRightLeft, Loader2, Mail, MessageSquare, PhoneCall, Settings2 } from "lucide-react";
import { addNote } from "@/app/admin/actions";
import { Card, fmtDate, relTime } from "./ui";

type Item = { id: string; at: string; by: string; type: string; text: string };

const ICONS: Record<string, { icon: typeof MessageSquare; cls: string }> = {
  note: { icon: MessageSquare, cls: "bg-sky-50 text-sky-700" },
  call: { icon: PhoneCall, cls: "bg-emerald-50 text-emerald-700" },
  status: { icon: ArrowRightLeft, cls: "bg-violet-50 text-violet-700" },
  email: { icon: Mail, cls: "bg-amber-50 text-amber-700" },
  system: { icon: Settings2, cls: "bg-slate-100 text-slate-600" },
};

export function Timeline({ id, items }: { id: string; items: Item[] }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  const submit = (type: "note" | "call") =>
    start(async () => {
      const r = await addNote(id, text || (type === "call" ? "Called candidate" : ""), type);
      if (r.ok) setText("");
      else setErr(r.error);
    });

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Activity</h2>
      <div className="mt-3 rounded-xl border border-black/10 bg-white focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErr("");
          }}
          rows={2}
          placeholder="Add a note, or log a call (e.g. “RNR”, “Switched off”, “Will join 21st”)"
          className="block w-full resize-none rounded-t-xl px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex items-center justify-end gap-2 border-t border-black/5 px-2 py-2">
          {err && <span className="mr-auto text-xs text-rose-600">{err}</span>}
          {pending && <Loader2 className="size-4 animate-spin text-muted" />}
          <button type="button" disabled={pending} onClick={() => submit("call")} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
            <PhoneCall className="size-3.5" /> Log call
          </button>
          <button type="button" disabled={pending || !text.trim()} onClick={() => submit("note")} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
            Add note
          </button>
        </div>
      </div>
      <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-black/10">
        {items.map((a) => {
          const { icon: Icon, cls } = ICONS[a.type] ?? ICONS.system;
          return (
            <li key={a.id} className="relative flex gap-3">
              <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-white ${cls}`}>
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="whitespace-pre-line text-sm text-ink/90">{a.text}</p>
                <p className="mt-0.5 text-xs text-muted" title={fmtDate(a.at, true)}>
                  {a.by} · {relTime(a.at)}
                </p>
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li className="pl-11 text-sm text-muted">No activity yet.</li>}
      </ol>
    </Card>
  );
}
