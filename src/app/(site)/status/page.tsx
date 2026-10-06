import type { Metadata } from "next";
import { StatusTracker } from "./StatusTracker";
import { statusSchema } from "@/lib/validation";
import { lookupStatus, type StatusResult } from "@/lib/status";

export const metadata: Metadata = {
  title: "Track your application",
  description: "Check the status of your KelasaHub job application with your Candidate ID.",
};

export default async function StatusPage(props: PageProps<"/status">) {
  const sp = await props.searchParams;
  const id = typeof sp.id === "string" ? sp.id : "";
  const phone = typeof sp.phone === "string" ? sp.phone : "";

  // Links from the apply dialog / track band arrive with both values — resolve them server-side.
  let initial: { result: StatusResult | null; error: string } | null = null;
  if (id && phone) {
    const parsed = statusSchema.safeParse({ candidateId: id, phone });
    if (!parsed.success) initial = { result: null, error: parsed.error.issues[0].message };
    else {
      const result = await lookupStatus(parsed.data.candidateId, parsed.data.phone);
      initial = { result, error: result ? "" : "We couldn't find an application with that ID and phone number." };
    }
  }
  return (
    <section className="relative min-h-[80dvh] overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_65%)]" />
        <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-teal/20 blur-[110px]" />
        <div className="absolute -right-24 top-40 size-[22rem] rounded-full bg-sun/25 blur-[110px]" />
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-teal-deep">Candidate portal</p>
        <h1 className="mt-3 text-center font-display text-5xl font-bold leading-[1] tracking-tight sm:text-6xl">
          Where&apos;s my <span className="scribble">application?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-lg text-muted">
          Enter the Candidate ID you got after applying and the mobile number you used.
        </p>
        <StatusTracker key={`${id}|${phone}`} initialId={id} initialPhone={phone} initial={initial} />
      </div>
    </section>
  );
}
