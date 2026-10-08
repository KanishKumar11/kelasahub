"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { deleteJob, saveJob, type ActionResult } from "@/app/admin/actions";
import { WORK_MODES } from "@/lib/constants";
import { Card, Label, btn, inputCls } from "./ui";

type Values = {
  title: string;
  slug: string;
  partner: string;
  salary: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  location: string;
  openings: string;
  workMode: string;
  shifts: string;
  shiftStart: string;
  shiftEnd: string;
  image: string;
  order: string;
  isActive: boolean;
};

const PRESETS = [
  "/assets/telecallers.jpeg",
  "/assets/telecallers-2.jpeg",
  "/assets/hr-recruiter.jpeg",
  "/assets/qa-executive.jpeg",
  "/assets/team-leader.jpeg",
  "/assets/process-trainer.jpeg",
  "/assets/assistant-manager-sales.jpeg",
  "/assets/french-spanish-advisor.jpeg",
];

export function JobForm({
  id,
  values: v,
  partners,
  canDelete,
}: {
  id: string | null;
  values: Values;
  partners: { id: string; name: string }[];
  canDelete: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveJob.bind(null, id), null);
  const [image, setImage] = useState(v.image);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function upload(f: File) {
    setUploading(true);
    setUploadErr("");
    try {
      const body = new FormData();
      body.append("file", f);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImage(data.url);
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <form action={action} id="job-form" className="space-y-4">
        <input type="hidden" name="image" value={image} />
        <Card className="space-y-4 p-5">
          <label className="block">
            <Label>Job title</Label>
            <input name="title" defaultValue={v.title} required className={inputCls} placeholder="e.g. Telecallers (Agent Level)" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Hiring partner</Label>
              <select name="partner" defaultValue={v.partner} className={inputCls}>
                <option value="">—</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>Work location</Label>
              <input name="location" defaultValue={v.location} className={inputCls} />
            </label>
          </div>
          <label className="block">
            <Label>Salary (as shown on site)</Label>
            <input name="salary" defaultValue={v.salary} className={inputCls} placeholder="Up to ₹18,000/month + incentives" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <Label>Min ₹/month</Label>
              <input name="salaryMin" type="number" defaultValue={v.salaryMin} className={inputCls} />
            </label>
            <label className="block">
              <Label>Max ₹/month</Label>
              <input name="salaryMax" type="number" defaultValue={v.salaryMax} className={inputCls} />
            </label>
            <label className="block">
              <Label>Openings</Label>
              <input name="openings" type="number" defaultValue={v.openings} className={inputCls} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="block">
              <Label>Job type</Label>
              <select name="workMode" defaultValue={v.workMode} className={inputCls}>
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>No. of shifts</Label>
              <input name="shifts" type="number" min={1} defaultValue={v.shifts} className={inputCls} />
            </label>
            <label className="block">
              <Label>Shift start</Label>
              <input name="shiftStart" type="time" defaultValue={v.shiftStart} className={inputCls} />
            </label>
            <label className="block">
              <Label>Shift end</Label>
              <input name="shiftEnd" type="time" defaultValue={v.shiftEnd} className={inputCls} />
            </label>
          </div>
          <label className="block">
            <Label>Description</Label>
            <textarea name="description" rows={3} defaultValue={v.description} className={inputCls} />
          </label>
          <label className="block">
            <Label>Requirements</Label>
            <textarea name="requirements" rows={4} defaultValue={v.requirements} className={inputCls} placeholder="Separate points with full stops or semicolons — the site shows them as a checklist." />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <Label>URL slug</Label>
              <input name="slug" defaultValue={v.slug} className={inputCls} placeholder="auto from title" />
            </label>
            <label className="block">
              <Label>Display order</Label>
              <input name="order" type="number" defaultValue={v.order} className={inputCls} />
            </label>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked={v.isActive} className="size-4 accent-teal" /> Live on the website
          </label>
        </Card>
        <div className="flex items-center gap-3">
          {state && !state.ok && <p className="text-sm font-medium text-rose-600">{state.error}</p>}
          <button disabled={pending} className={`${btn.primary} ml-auto`}>
            {pending && <Loader2 className="size-4 animate-spin" />} {id ? "Save job" : "Publish job"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <Card className="p-5">
          <Label>Poster image</Label>
          <div className="relative mt-1 aspect-square overflow-hidden rounded-xl bg-slate-100">
            {image ? (
              <Image src={image} alt="Job poster" fill sizes="320px" className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-sm text-muted">No image</div>
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-white/70">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
          </div>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => file.current?.click()} className={`${btn.secondary} flex-1`}>
              <ImagePlus className="size-4" /> Upload
            </button>
            {image && (
              <button type="button" onClick={() => setImage("")} className={btn.secondary} title="Remove image">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          {uploadErr && <p className="mt-2 text-xs text-rose-600">{uploadErr}</p>}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Or pick an existing poster</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setImage(p)}
                className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${image === p ? "ring-teal" : "ring-transparent hover:ring-black/20"}`}
              >
                <Image src={p} alt="" fill sizes="70px" className="object-cover" />
              </button>
            ))}
          </div>
        </Card>
        {canDelete && id && (
          <form
            action={deleteJob.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm("Delete this job? Candidates who applied keep their records.")) e.preventDefault();
            }}
          >
            <button className={`${btn.danger} w-full`}>
              <Trash2 className="size-4" /> Delete job
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
