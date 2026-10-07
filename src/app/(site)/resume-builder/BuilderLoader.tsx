"use client";

import dynamic from "next/dynamic";
import type { ResumeData } from "@/lib/resume";
import type { BuilderExample, BuilderJob } from "./ResumeBuilder";

// Client-only: the builder restores drafts from this device's storage on first render.
const ResumeBuilder = dynamic(() => import("./ResumeBuilder"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-2">
      <div className="h-[36rem] animate-pulse rounded-[1.75rem] bg-paper-2" />
      <div className="hidden h-[36rem] animate-pulse rounded-[1.75rem] bg-paper-2 lg:block" />
    </div>
  ),
});

export function BuilderLoader(props: {
  signedIn: boolean;
  initial: { data: ResumeData; saved: boolean } | null;
  example: BuilderExample | null;
  jobs: BuilderJob[];
}) {
  return <ResumeBuilder {...props} />;
}
