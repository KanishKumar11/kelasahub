"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, ExternalLink, Handshake, LayoutDashboard, LogOut, Menu, UserCog, Users, X } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/site/Logo";

type Props = {
  user: { name: string; email: string; role: string };
  counts: { newCandidates: number; newLeads: number };
};

export function Sidebar({ user, counts }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/candidates", label: "Candidates", icon: Users, badge: counts.newCandidates },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/partners", label: "Partners", icon: Building2 },
    { href: "/admin/leads", label: "Business leads", icon: Handshake, badge: counts.newLeads },
    ...(user.role === "admin" ? [{ href: "/admin/users", label: "Team", icon: UserCog }] : []),
  ];

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo light />
      </div>
      <div className="flex-1 space-y-1 px-3">
        {items.map(({ href, label, icon: Icon, badge, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white text-ink shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-[18px]" />
              <span className="flex-1">{label}</span>
              {!!badge && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-teal text-white" : "bg-sun text-ink"}`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        <a
          href="/"
          target="_blank"
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition hover:text-white"
        >
          <ExternalLink className="size-[18px]" /> View website
        </a>
      </div>
      <div className="m-3 rounded-2xl bg-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-teal font-display text-sm font-bold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-white/50">{user.role}</p>
          </div>
          <form action={logoutAction}>
            <button title="Sign out" className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">{nav}</aside>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo light />
        <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl text-white" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-rise bg-ink">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid size-9 place-items-center rounded-lg text-white" aria-label="Close menu">
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
