import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif-src", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
// Self-hosted: next/font/google fails to resolve this font's files on Netlify builds.
const kannada = localFont({
  variable: "--font-kannada-src",
  src: "./fonts/NotoSansKannada-700-800.woff2",
  weight: "700 800",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  icons: { icon: "/assets/kelasahub-icon.png" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/assets/telecallers.jpeg"],
  },
};

export const viewport: Viewport = { themeColor: "#0b1f3a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${serif.variable} ${kannada.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
