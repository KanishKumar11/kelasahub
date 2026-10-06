"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deletePartner, savePartner, type ActionResult } from "@/app/admin/actions";
import { Card, Label, btn, inputCls } from "./ui";

type P = {
  id: string;
  name: string;
  location: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  showOnSite: boolean;
  isActive: boolean;
  candidates: number;
  selected: number;
  liveJobs: number;
};

export function PartnerManager({ partners }: { partners: P[] }) {
  const [editing, setEditing] = useState<P | "new" | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className={btn.primary}>
          <Plus className="size-4" /> Add partner
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((p) => (
          <Card key={p.id} className={`p-5 ${p.isActive ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-muted">{p.location || "—"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(p)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink" title="Edit">
                  <Pencil className="size-4" />
                </button>
                <button
                  disabled={pending}
                  onClick={() =>
                    confirm(`Delete ${p.name}?`) &&
                    start(async () => {
                      const r = await deletePartner(p.id);
                      if (!r.ok) alert(r.error);
                    })
                  }
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {(p.contactPerson || p.phone || p.email) && (
              <p className="mt-3 text-sm text-ink/80">{[p.contactPerson, p.phone, p.email].filter(Boolean).join(" · ")}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
              <Link href={`/admin/candidates?partner=${p.id}`} className="rounded-lg py-1 hover:bg-slate-50">
                <p className="font-display text-xl font-bold">{p.candidates}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">Candidates</p>
              </Link>
              <Link href={`/admin/candidates?partner=${p.id}&overall=Selected`} className="rounded-lg py-1 hover:bg-slate-50">
                <p className="font-display text-xl font-bold text-emerald-700">{p.selected}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">Selected</p>
              </Link>
              <div className="py-1">
                <p className="font-display text-xl font-bold">{p.liveJobs}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">Live jobs</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {p.showOnSite && <span className="rounded-full bg-teal-soft px-2 py-0.5 font-semibold text-teal-deep">On website</span>}
              {!p.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Inactive</span>}
              <a href={`/api/admin/pdf/shortlist?partner=${p.id}&screening=Shortlisted`} target="_blank" className="ml-auto font-semibold text-teal-deep hover:underline">
                Shortlist PDF →
              </a>
            </div>
          </Card>
        ))}
      </div>
      {editing && <PartnerDialog partner={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function PartnerDialog({ partner, onClose }: { partner: P | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(savePartner.bind(null, partner?.id ?? null), null);
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  const p = partner;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form action={action} className="w-full max-w-lg animate-pop rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{p ? `Edit ${p.name}` : "Add partner"}</h2>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <Label>Company name</Label>
            <input name="name" defaultValue={p?.name} required className={inputCls} />
          </label>
          <label className="block">
            <Label>Location (for PDF header)</Label>
            <input name="location" defaultValue={p?.location} placeholder="HBR Layout, Bangalore" className={inputCls} />
          </label>
          <label className="block">
            <Label>Contact person</Label>
            <input name="contactPerson" defaultValue={p?.contactPerson} className={inputCls} />
          </label>
          <label className="block">
            <Label>Phone</Label>
            <input name="phone" defaultValue={p?.phone} className={inputCls} />
          </label>
          <label className="block">
            <Label>Email</Label>
            <input name="email" type="email" defaultValue={p?.email} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <Label>Address</Label>
            <input name="address" defaultValue={p?.address} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="showOnSite" defaultChecked={p?.showOnSite ?? true} className="size-4 accent-teal" /> Show on website
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked={p?.isActive ?? true} className="size-4 accent-teal" /> Active
          </label>
        </div>
        {state && !state.ok && <p className="mt-4 text-sm text-rose-600">{state.error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btn.secondary}>
            Cancel
          </button>
          <button disabled={pending} className={btn.primary}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </div>
      </form>
    </div>
  );
}
