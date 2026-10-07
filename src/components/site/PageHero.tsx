import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/constants";
import { JsonLd } from "./JsonLd";

type Crumb = { label: string; href: string };

/** Opening block for inner pages: breadcrumb (+ BreadcrumbList data), eyebrow, the page's one h1, and a lead. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  tone = "teal",
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  tone?: "teal" | "sun";
}) {
  const trail = [{ label: "Home", href: "/" }, ...crumbs];
  return (
    <section className="relative overflow-hidden pb-14 pt-28 sm:pb-20 sm:pt-36">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${SITE.url}${c.href === "/" ? "" : c.href}` })),
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,#000_15%,transparent_60%)]" />
        <div className={`absolute -right-24 -top-16 size-[28rem] rounded-full blur-[110px] ${tone === "sun" ? "bg-sun/30" : "bg-teal/20"}`} />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm font-medium text-muted">
            {trail.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3.5 opacity-50" />}
                {i < trail.length - 1 ? (
                  <Link href={c.href} className="transition hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">
          <span className="h-px w-8 bg-teal-deep" /> {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl animate-rise font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">{title}</h1>
        {lead && <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-muted [animation-delay:80ms] sm:text-xl">{lead}</p>}
        {children && <div className="mt-8 animate-rise [animation-delay:140ms]">{children}</div>}
      </div>
    </section>
  );
}
