import "server-only";
import path from "node:path";
import { readFileSync } from "node:fs";
import { Font, StyleSheet } from "@react-pdf/renderer";

const fontDir = path.join(process.cwd(), "assets", "fonts");
let registered = false;

export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(fontDir, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontDir, "Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontDir, "Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({ family: "Bricolage", src: path.join(fontDir, "Bricolage-Bold.ttf"), fontWeight: 700 });
  Font.registerHyphenationCallback((w) => [w]);
  registered = true;
}

// Small pre-shrunk PNGs as data-URI strings: react-pdf caches string sources, so each image
// is embedded once per document instead of once per use (the watermark repeats ~40×/page).
const dataUri = (file: string) =>
  `data:image/png;base64,${readFileSync(path.join(process.cwd(), "assets", file)).toString("base64")}`;
export const LOGO_PATH = dataUri("pdf-logo.png");
export const WATERMARK_PATH = dataUri("pdf-watermark.png");
// Full-size logo for the single centred watermark on resumes.
export const WATERMARK_CENTER_PATH = dataUri("pdf-watermark-center.png");

export const C = {
  ink: "#0b1f3a",
  teal: "#14a39a",
  tealDeep: "#0e7c75",
  sun: "#f6b93b",
  amber: "#d9821c",
  paper: "#f5f6f8",
  line: "#dfe3ea",
  muted: "#5b6b7f",
  text: "#1c2b40",
};

export const base = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9.5, color: C.text, paddingBottom: 60 },
});

export const fmt = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "";
