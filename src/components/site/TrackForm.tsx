"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

/** Compact form that hands off to /status, which does the actual lookup. */
export function TrackForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const qs = new URLSearchParams({ id: id.trim().toUpperCase(), email: email.trim() });
        router.push(`/status?${qs}`);
      }}
      className={`grid gap-2.5 rounded-3xl bg-white/15 p-2.5 backdrop-blur ${compact ? "md:grid-cols-[1fr_1fr_auto]" : ""}`}
    >
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Candidate ID (K-2026-0123)"
        aria-label="Candidate ID"
        className="rounded-2xl bg-white px-4 py-3.5 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:ring-4 focus:ring-sun/40"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email you applied with"
        aria-label="Email"
        autoComplete="email"
        className="rounded-2xl bg-white px-4 py-3.5 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:ring-4 focus:ring-sun/40"
        required
      />
      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2">
        Check status <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
