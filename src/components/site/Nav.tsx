"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "Free resume", href: "/resume-builder" },
  { label: "For employers", href: "/employers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Nav({ signedIn = false }: { signedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-300 sm:px-4 ${
          scrolled || open
            ? "border-2 border-ink bg-paper/95 shadow-[0_10px_30px_-14px_rgba(11,31,58,0.35)] backdrop-blur-xl"
            : "border-2 border-transparent"
        }`}
      >
        <Link href="/" aria-label="KelasaHub home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition hover:bg-ink/5 hover:text-ink ${active(l.href) ? "bg-ink/5 text-ink" : "text-ink/75"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            aria-current={active("/account") ? "page" : undefined}
            aria-label={signedIn ? "My account" : "Sign in"}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-2 text-sm font-bold transition hover:bg-ink hover:text-white sm:px-4"
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline">{signedIn ? "My account" : "Sign in"}</span>
          </Link>
          <Link
            href="/jobs"
            className="group hidden items-center gap-1.5 rounded-full border-2 border-ink bg-sun px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)] sm:inline-flex"
          >
            Find a job <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <button
            className="grid size-10 place-items-center rounded-xl text-ink transition hover:bg-ink/5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-7xl animate-pop rounded-2xl border border-white/60 bg-white/90 p-2 shadow-xl backdrop-blur-xl lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active(l.href) ? "page" : undefined}
              className={`block rounded-xl px-4 py-3 text-[15px] font-medium text-ink hover:bg-ink/5 ${active(l.href) ? "bg-ink/5" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jobs"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-[15px] font-semibold text-white"
          >
            Find a job <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
