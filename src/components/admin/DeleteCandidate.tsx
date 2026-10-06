"use client";

import { Trash2 } from "lucide-react";
import { deleteCandidate } from "@/app/admin/actions";
import { btn } from "./ui";

export function DeleteCandidate({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCandidate.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete ${name}? This permanently removes the candidate and their history.`)) e.preventDefault();
      }}
    >
      <button className={`${btn.danger} w-full`}>
        <Trash2 className="size-4" /> Delete candidate
      </button>
    </form>
  );
}
