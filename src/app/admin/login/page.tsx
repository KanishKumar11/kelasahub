import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div className="bg-grid-dark absolute inset-0" />
        <div className="absolute -left-24 bottom-0 size-[28rem] rounded-full bg-teal/30 blur-[110px]" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative mt-auto">
          <p className="font-display text-5xl font-bold leading-[1.02] tracking-tight">
            Every candidate,
            <br />
            <span className="text-sun">one pipeline.</span>
          </p>
          <p className="mt-4 max-w-md text-white/65">
            Screening, interviews, selections, joining and first-month follow-ups — all in one place.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">Welcome back</h1>
          <p className="mt-1.5 text-muted">Sign in to the KelasaHub admin panel.</p>
          <LoginForm next={next} />
        </div>
      </section>
    </main>
  );
}
