"use client";

import { useActionState, useTransition } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { changeOwnPassword, saveUser, updateUser, type ActionResult } from "@/app/admin/actions";
import { Card, Label, btn, inputCls } from "./ui";

type U = { id: string; name: string; email: string; role: string; isActive: boolean; lastLogin: string };

export function TeamManager({ users, me }: { users: U[]; me: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveUser, null);
  const [pwState, pwAction, pwPending] = useActionState<ActionResult | null, FormData>(changeOwnPassword, null);
  const [busy, start] = useTransition();

  const patch = (id: string, p: Parameters<typeof updateUser>[1]) =>
    start(async () => {
      const r = await updateUser(id, p);
      if (!r.ok) alert(r.error);
      else if (p.password) alert("Password reset");
    });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Member</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Last sign-in</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((u) => (
              <tr key={u.id} className={u.isActive ? "" : "opacity-50"}>
                <td className="px-4 py-3">
                  <p className="font-semibold">
                    {u.name} {u.id === me && <span className="text-xs font-normal text-muted">(you)</span>}
                  </p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-3 py-3">
                  <select
                    defaultValue={u.role}
                    disabled={busy || u.id === me}
                    onChange={(e) => patch(u.id, { role: e.target.value })}
                    className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm capitalize"
                  >
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </td>
                <td className="px-3 py-3 text-muted">{u.lastLogin}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={busy}
                      onClick={() => {
                        const pw = prompt(`New password for ${u.name} (min 8 characters)`);
                        if (pw) patch(u.id, { password: pw });
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100"
                    >
                      Reset password
                    </button>
                    {u.id !== me && (
                      <button disabled={busy} onClick={() => patch(u.id, { isActive: !u.isActive })} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-slate-100">
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="font-semibold">Add team member</h2>
          <form action={action} className="mt-4 space-y-3">
            <label className="block">
              <Label>Name</Label>
              <input name="name" required className={inputCls} />
            </label>
            <label className="block">
              <Label>Email</Label>
              <input name="email" type="email" required className={inputCls} />
            </label>
            <label className="block">
              <Label>Temporary password</Label>
              <input name="password" type="text" minLength={8} required className={inputCls} />
            </label>
            <label className="block">
              <Label>Role</Label>
              <select name="role" defaultValue="recruiter" className={inputCls}>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {state && <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.ok ? state.message : state.error}</p>}
            <button disabled={pending} className={`${btn.primary} w-full`}>
              {pending && <Loader2 className="size-4 animate-spin" />} Add member
            </button>
          </form>
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <KeyRound className="size-4" /> Change my password
          </h2>
          <form action={pwAction} className="mt-4 space-y-3">
            <input name="current" type="password" placeholder="Current password" required className={inputCls} />
            <input name="next" type="password" placeholder="New password (min 8)" minLength={8} required className={inputCls} />
            {pwState && <p className={`text-sm ${pwState.ok ? "text-emerald-700" : "text-rose-600"}`}>{pwState.ok ? pwState.message : pwState.error}</p>}
            <button disabled={pwPending} className={`${btn.secondary} w-full`}>
              Update password
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
