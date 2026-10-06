"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  AREAS,
  ATTRITION,
  INTERVIEW_STATUS,
  OVERALL_STATUS,
  QUALITY,
  SCREENING_STATUS,
  SHIFT_PREFERENCE,
  SOURCES,
  TRAINING,
} from "@/lib/constants";
import { saveCandidate, type ActionResult } from "@/app/admin/actions";
import { Card, Label, btn, inputCls } from "./ui";

export type CandidateFormValues = {
  name: string;
  phone: string;
  email: string;
  source: string;
  role: string;
  partner: string;
  area: string;
  nationality: string;
  address: string;
  pincode: string;
  languages: string;
  employmentStatus: string;
  expYears: string;
  lastCompany: string;
  targetSalary: string;
  referredBy: string;
  edu_tenth: string;
  edu_twelfth: string;
  edu_graduate: string;
  edu_postGraduate: string;
  interviewDate: string;
  dateSelected: string;
  joiningDate: string;
  lastContacted: string;
  notes: string;
};

function In({ name, label, v, type = "text", ...rest }: { name: keyof CandidateFormValues; label: string; v: CandidateFormValues; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input name={name} type={type} defaultValue={v[name]} className={inputCls} {...rest} />
    </label>
  );
}

function Sel({ name, label, options, defaultValue, empty = true }: { name: string; label: string; options: readonly (string | { value: string; label: string })[]; defaultValue: string; empty?: boolean }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select name={name} defaultValue={defaultValue} className={inputCls}>
        {empty && <option value="">—</option>}
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

export function CandidateForm({
  id,
  values,
  partners,
  roles,
}: {
  id: string | null;
  values: CandidateFormValues;
  partners: { id: string; name: string }[];
  roles: string[];
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveCandidate.bind(null, id), null);
  const saved = !!state?.ok && !pending;

  const v = values;
  const isNew = !id;

  return (
    <form action={action} className="space-y-4">
      {isNew && (
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Pipeline</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Sel name="screeningStatus" label="Screening" options={SCREENING_STATUS} defaultValue="New" empty={false} />
            <Sel name="interviewStatus" label="Interview" options={INTERVIEW_STATUS} defaultValue="Not Scheduled" empty={false} />
            <Sel name="overallStatus" label="Overall" options={OVERALL_STATUS} defaultValue="" />
            <Sel name="quality" label="Quality" options={QUALITY} defaultValue="" />
            <Sel name="shiftPreference" label="Shift preference" options={SHIFT_PREFERENCE} defaultValue="" />
            <Sel name="firstMonthAttrition" label="First-month attrition" options={ATTRITION} defaultValue="" />
            <Sel name="trainingGraduation" label="Training" options={TRAINING} defaultValue="" />
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Application</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <In name="name" label="Full name" v={v} required />
          <In name="phone" label="Phone" v={v} type="tel" required />
          <In name="email" label="Email" v={v} type="email" />
          <label className="block">
            <Label>Role applied</Label>
            <input name="role" list="roles" defaultValue={v.role} className={inputCls} />
            <datalist id="roles">
              {roles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </label>
          <Sel name="partner" label="BPO partner" options={partners.map((p) => ({ value: p.id, label: p.name }))} defaultValue={v.partner} />
          <Sel name="source" label="Source" options={[...new Set([...SOURCES, v.source].filter(Boolean))]} defaultValue={v.source || "Manual Entry"} empty={false} />
          <Sel name="area" label="Area (Bangalore)" options={[...new Set([...AREAS, v.area].filter(Boolean))]} defaultValue={v.area} />
          <In name="targetSalary" label="Target salary (₹/mo)" v={v} placeholder="e.g. 16000" />
          <In name="referredBy" label="Referred by" v={v} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Dates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <In name="interviewDate" label="Interview date" v={v} type="date" />
          <In name="dateSelected" label="Date selected" v={v} type="date" />
          <In name="joiningDate" label="Joining date" v={v} type="date" />
          <In name="lastContacted" label="Last contacted" v={v} type="date" />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Personal &amp; experience</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <In name="nationality" label="Nationality" v={v} />
          <In name="pincode" label="Pincode" v={v} />
          <In name="languages" label="Languages (comma separated)" v={v} placeholder="Kannada, Hindi, English" />
          <div className="sm:col-span-2 lg:col-span-3">
            <In name="address" label="Address" v={v} />
          </div>
          <Sel name="employmentStatus" label="Employment status" options={["Fresher", "Experienced"]} defaultValue={v.employmentStatus} />
          <In name="expYears" label="Years of experience" v={v} />
          <In name="lastCompany" label="Last company" v={v} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Education</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <In name="edu_tenth" label="10th standard" v={v} />
          <In name="edu_twelfth" label="12th / 2nd PUC" v={v} />
          <In name="edu_graduate" label="Graduate" v={v} />
          <In name="edu_postGraduate" label="Post-graduate" v={v} />
        </div>
      </Card>

      <Card className="p-5">
        <label className="block">
          <Label>Notes (shown in the table &amp; exports)</Label>
          <textarea name="notes" defaultValue={v.notes} rows={3} className={inputCls} placeholder="e.g. Can join after 20th; expecting 30% hike" />
        </label>
      </Card>

      <div className="sticky bottom-3 z-10 flex items-center justify-end gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur">
        {state && !state.ok && <p className="mr-auto text-sm font-medium text-rose-600">{state.error}</p>}
        {saved && (
          <p className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Check className="size-4" /> Saved
          </p>
        )}
        <button disabled={pending} className={btn.primary}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isNew ? "Create candidate" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
