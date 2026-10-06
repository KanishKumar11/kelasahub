"use client";

import { useState, useTransition } from "react";
import { LEAD_STATUS, candidateWhatsApp } from "@/lib/constants";
import { updateLead } from "@/app/admin/actions";
import { toneFor } from "./ui";

type Lead = {
  id: string;
  company: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  businessType: string;
  headcount: string;
  received: string;
  status: string;
  notes: string;
};

export function LeadRow({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes);
  const [, start] = useTransition();

  return (
    <tr className="align-top hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <p className="font-semibold">{lead.company}</p>
        <p className="text-xs text-muted">{lead.businessType}</p>
      </td>
      <td className="px-3 py-3">
        <p className="font-medium">{lead.name}</p>
        <p className="text-xs text-muted">{lead.designation}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          {lead.phone && (
            <>
              <a href={`tel:${lead.phone}`} className="text-teal-deep hover:underline">{lead.phone}</a>
              <a href={candidateWhatsApp(lead.phone)} target="_blank" rel="noopener noreferrer" className="text-[#1da851] hover:underline">WhatsApp</a>
            </>
          )}
          {lead.email && <a href={`mailto:${lead.email}`} className="text-teal-deep hover:underline">{lead.email}</a>}
        </div>
      </td>
      <td className="px-3 py-3 text-ink/80">{lead.headcount || "—"}</td>
      <td className="whitespace-nowrap px-3 py-3 text-ink/80">{lead.received}</td>
      <td className="px-3 py-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            start(() => updateLead(lead.id, { status: e.target.value }).then(() => {}));
          }}
          className={`cursor-pointer appearance-none rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset outline-none ${toneFor(status === "New" ? "New" : status)}`}
        >
          {LEAD_STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== lead.notes && start(() => updateLead(lead.id, { notes }).then(() => {}))}
          rows={1}
          placeholder="Add note…"
          className="w-full min-w-48 resize-y rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none hover:border-black/10 focus:border-teal focus:bg-white"
        />
      </td>
    </tr>
  );
}
