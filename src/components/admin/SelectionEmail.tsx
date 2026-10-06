"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { markSelectionEmail } from "@/app/admin/actions";
import { Card, btn } from "./ui";

export function SelectionEmail({
  id,
  sent,
  sentAt,
  hasEmail,
  smtp,
  mailto,
}: {
  id: string;
  sent: boolean;
  sentAt: string | null;
  hasEmail: boolean;
  smtp: boolean;
  mailto: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const act = (send: boolean) =>
    start(async () => {
      const r = await markSelectionEmail(id, send);
      setMsg(r.ok ? r.message ?? "Done" : r.error);
    });

  return (
    <Card className="border-emerald-200 bg-emerald-50/40 p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Mail className="size-4 text-emerald-700" /> Selection email
      </h2>
      {sent ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> Sent {sentAt ? `on ${sentAt}` : ""}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">Congratulate the candidate and share joining instructions.</p>
      )}
      {!hasEmail ? (
        <p className="mt-3 text-sm text-amber-700">No email on file — add one below, or share the news on WhatsApp.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {smtp && (
            <button disabled={pending} onClick={() => act(true)} className={btn.primary}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {sent ? "Send again" : "Send now"}
            </button>
          )}
          <a href={mailto} className={btn.secondary}>
            Open in mail app
          </a>
          {!sent && (
            <button disabled={pending} onClick={() => act(false)} className="text-sm font-semibold text-emerald-800 hover:underline">
              Mark as sent
            </button>
          )}
        </div>
      )}
      {msg && <p className="mt-3 text-sm font-medium">{msg}</p>}
    </Card>
  );
}
