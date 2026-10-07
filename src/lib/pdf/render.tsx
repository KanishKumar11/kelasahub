import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { registerFonts } from "./shared";
import { ApplicationForms, type ApplicationData } from "./ApplicationForm";
import { ShortlistDoc, type ShortlistRow } from "./Shortlist";
import { ResumeDoc } from "./Resume";
import type { ResumeData } from "../resume";

export async function renderApplications(candidates: ApplicationData[]) {
  registerFonts();
  return renderToBuffer(<ApplicationForms candidates={candidates} />);
}

export async function renderShortlist(rows: ShortlistRow[], title: string, subtitle: string) {
  registerFonts();
  return renderToBuffer(<ShortlistDoc rows={rows} title={title} subtitle={subtitle} />);
}

export async function renderResume(r: ResumeData) {
  registerFonts();
  return renderToBuffer(<ResumeDoc r={r} />);
}

export const resumeFilename = (r: ResumeData) => `${(r.name || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;

export function pdfResponse(buf: Buffer, filename: string, download = false) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename.replace(/[^\w.\- ]/g, "")}"`,
    },
  });
}
