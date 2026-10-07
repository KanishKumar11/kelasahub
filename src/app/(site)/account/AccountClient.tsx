"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { CandidateSignIn } from "@/components/site/CandidateSignIn";

export function SignInPanel() {
  const router = useRouter();
  return <CandidateSignIn onSignedIn={() => router.refresh()} />;
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/account/logout", { method: "POST" });
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold transition hover:bg-ink hover:text-white disabled:opacity-60"
    >
      <LogOut className="size-4" /> Sign out
    </button>
  );
}
