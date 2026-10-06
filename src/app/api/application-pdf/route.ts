import { pdfResponse, renderApplications } from "@/lib/pdf/render";
import { applicationFilename, loadApplications, readApplicationPdfToken } from "@/lib/pdf/applications";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/application-pdf?t=<signed token> → the candidate's own application form.
// Links are handed out after applying, in the confirmation email and on the status page.
export async function GET(req: Request) {
  if (!rateLimit(req, "app-pdf", 20)) return new Response("Too many requests — try again in a minute.", { status: 429 });
  const id = await readApplicationPdfToken(new URL(req.url).searchParams.get("t"));
  if (!id) {
    return new Response("This download link has expired. Check your status on kelasahub.in/status to get a new one.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const data = await loadApplications([id]);
  if (!data.length) return new Response("Application not found.", { status: 404 });
  return pdfResponse(await renderApplications(data), applicationFilename(data), true);
}
