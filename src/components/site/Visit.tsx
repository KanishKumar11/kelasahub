import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { OFFICE, SITE, whatsappLink } from "@/lib/constants";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";

/** `intro={false}` drops the heading when the page already has its own (the /contact h1). */
export function Visit({ intro = true }: { intro?: boolean }) {
  const rows = [
    { icon: MapPin, label: "Address", value: OFFICE.address, href: OFFICE.mapLink, ext: true },
    { icon: Phone, label: "Call us", value: SITE.phoneDisplay, href: `tel:${SITE.phoneTel}` },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  ];
  return (
    <section id="visit" className={`scroll-mt-20 ${intro ? "py-20 sm:py-28" : "pb-20 sm:pb-28"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {intro && (
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep"><span className="h-px w-8 bg-teal-deep" /> Visit us</p>
          <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            Walk in. <span className="accent text-teal-deep">Say hello.</span>
          </h2>
          <p className="mt-4 text-lg text-muted">Free to join, zero rupees to pay. Walk in, call or WhatsApp — whichever is easiest.</p>
        </Reveal>
        )}

        <Reveal delay={80} className={`relative grid ${intro ? "mt-12" : ""} overflow-hidden rounded-[2.5rem] border-2 border-ink bg-white shadow-[10px_10px_0_var(--color-ink)] lg:grid-cols-[0.9fr_1.1fr]`}>
          <div className="flex flex-col p-7 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal text-white">
                <MapPin className="size-6" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">{OFFICE.name}</p>
                <p className="text-sm text-muted">{OFFICE.shortArea}</p>
              </div>
            </div>
            <dl className="mt-8 space-y-5">
              {rows.map(({ icon: Icon, label, value, href, ext }) => (
                <div key={label} className="flex gap-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-teal-deep" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                    <dd className="mt-0.5 text-[15px] font-medium leading-relaxed">
                      {href ? (
                        <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="hover:text-teal-deep hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex flex-col gap-2.5 pt-10 sm:flex-row">
              <a
                href={OFFICE.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink"
              >
                <Navigation className="size-4" /> Get directions
              </a>
              <a
                href={whatsappLink("Hi KelasaHub, I'd like to visit your office. When can I come?")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-6 py-3.5 text-sm font-bold"
              >
                <WhatsAppIcon className="size-4 text-[#25D366]" /> Plan my visit
              </a>
            </div>
          </div>
          <div className="relative min-h-[22rem] border-t-2 border-ink bg-paper-2 lg:border-l-2 lg:border-t-0">
            <span className="sticker absolute right-4 top-4 z-10 rotate-6 bg-sun">Come say hi 👋</span>
            <iframe
              title="KelasaHub head office on Google Maps"
              src={OFFICE.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 size-full grayscale-[35%] contrast-[1.05]"
            />
            <a
              href={OFFICE.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur transition hover:-translate-y-0.5 sm:right-auto sm:max-w-xs"
            >
              <p className="text-sm font-semibold">KelasaHub on Google Maps</p>
              <p className="mt-0.5 text-xs text-muted">Open in Maps for live directions →</p>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
