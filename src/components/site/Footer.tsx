import Link from "next/link";
import { OFFICE, SITE, whatsappLink } from "@/lib/constants";
import { Logo } from "./Logo";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";

export function Footer() {
  const cols = [
    {
      title: "Candidates",
      links: [
        { label: "Current openings", href: "/#openings" },
        { label: "Track application", href: "/status" },
        { label: "How it works", href: "/#how" },
        { label: "FAQs", href: "/#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Hire manpower", href: "/#business" },
        { label: "Visit our office", href: "/#visit" },
        { label: "Directions", href: OFFICE.mapLink },
      ],
    },
  ];
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Closing call to action */}
      <div className="relative border-b-2 border-white/10">
        <span
          aria-hidden
          className="text-outline pointer-events-none absolute -right-[3vw] top-1/2 -translate-y-1/2 select-none font-kannada text-[22vw] font-extrabold leading-none text-white/15"
        >
          ಕೆಲಸ
        </span>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-6xl font-bold leading-[0.9] tracking-[-0.045em] sm:text-8xl">
            Ready when
            <br />
            <span className="accent text-sun">you</span> are.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/#openings"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-sun bg-sun px-7 py-4 text-[15px] font-bold text-ink shadow-[4px_4px_0_var(--color-teal)] transition hover:-translate-y-0.5"
            >
              Browse open roles →
            </Link>
            <a
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-7 py-4 text-[15px] font-bold transition hover:border-white"
            >
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/60">
              Free-to-candidate job consultancy for Bangalore&apos;s call-centre and BPO industry.
            </p>
            <div className="mt-6 flex gap-2.5">
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                <InstagramIcon className="size-5" />
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                <WhatsAppIcon className="size-5" />
              </a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[15px] text-white/80 transition hover:text-sun">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Reach us</h4>
            <ul className="mt-4 space-y-2.5 text-[15px] text-white/80">
              <li>
                <a href={`tel:${SITE.phoneTel}`} className="hover:text-sun">{SITE.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="hover:text-sun">{SITE.email}</a>
              </li>
              <li>
                <a href={OFFICE.mapLink} target="_blank" rel="noopener noreferrer" className="leading-relaxed hover:text-sun">
                  {OFFICE.address}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className="mx-auto mt-14 max-w-7xl select-none px-4 text-center font-display text-[16.5vw] font-bold leading-[0.8] tracking-tighter text-white/[0.06] sm:px-6 lg:text-[15rem]"
      >
        KelasaHub
      </p>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-6 text-sm text-white/50 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} KelasaHub. No placement fees, ever.</span>
          <span>
            Designed &amp; developed by{" "}
            <a href="https://zlaark.com" target="_blank" rel="noopener" className="font-semibold text-white/80 underline-offset-4 transition hover:text-sun hover:underline">
              Zlaark
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
