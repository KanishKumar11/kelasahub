"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/15"
        />
      </label>
      {state?.error && <p className="rounded-xl bg-coral/10 px-4 py-2.5 text-sm font-medium text-[#b9472b]">{state.error}</p>}
      <button
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 font-semibold text-white transition hover:bg-ink-2 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
