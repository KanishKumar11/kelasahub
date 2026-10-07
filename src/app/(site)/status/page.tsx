import type { Metadata } from "next";
import { StatusTracker } from "./StatusTracker";

export const metadata: Metadata = {
  alternates: { canonical: "/status" },
  title: "Track your application",
  description: "Check the status of your KelasaHub job application with your Candidate ID.",
};

export default async function StatusPage(props: PageProps<"/status">) {
  const sp = await props.searchParams;
  const id = typeof sp.id === "string" ? sp.id : "";
  const email = typeof sp.email === "string" ? sp.email : "";
  return (
    <section className="relative min-h-[80dvh] overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_65%)]" />
        <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-teal/20 blur-[110px]" />
        <div className="absolute -right-24 top-40 size-[22rem] rounded-full bg-sun/25 blur-[110px]" />
      </div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">Candidate portal</p>
        <h1 className="mt-3 text-center font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
          Where&apos;s my <span className="accent text-teal-deep">application?</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-center text-lg text-muted">
          Enter your Candidate ID and the email you applied with — we&apos;ll send you a code to see your status.
        </p>
        <StatusTracker key={`${id}|${email}`} initialId={id} initialEmail={email} />
      </div>
    </section>
  );
}
