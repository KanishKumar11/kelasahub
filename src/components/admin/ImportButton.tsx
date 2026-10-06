"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { btn } from "./ui";

/** Uploads an .xlsx in the Applications-sheet format and reports what was imported. */
export function ImportButton() {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/candidates/import", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Import complete — ${data.created} added, ${data.updated} updated, ${data.leads} business leads, ${data.skipped} skipped.`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <button className={btn.secondary} disabled={busy} onClick={() => input.current?.click()} title="Import candidates from an .xlsx in the Applications sheet format">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Import
      </button>
    </>
  );
}
