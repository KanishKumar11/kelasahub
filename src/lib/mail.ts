import "server-only";
import nodemailer from "nodemailer";
import { OFFICE, SITE } from "./constants";

type SelectionCandidate = {
  name: string;
  email: string;
  role: string;
  candidateId: string;
  joiningDate?: Date | null;
  partner?: { name: string; location: string; address?: string } | null;
};

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export function selectionEmail(c: SelectionCandidate) {
  const company = c.partner ? `${c.partner.name}${c.partner.location ? `, ${c.partner.location}` : ""}` : "our hiring partner";
  const joining = c.joiningDate
    ? new Date(c.joiningDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;
  const subject = `Congratulations ${c.name.split(" ")[0]}! You're selected — ${c.role}`;
  const text = [
    `Dear ${c.name},`,
    "",
    `Congratulations! You have been selected for the position of ${c.role} at ${company}.`,
    joining ? `Your joining date is ${joining}.` : "Our team will call you shortly to confirm your joining date.",
    "",
    "Please carry the following on your first day:",
    "• Aadhaar card and PAN card (original + 1 photocopy)",
    "• 2 passport-size photographs",
    "• Educational certificates",
    "• Bank account details",
    "",
    `Your Candidate ID: ${c.candidateId}`,
    "",
    "Remember — KelasaHub never charges candidates any fee. If anyone asks you for money in our name, please report it to us.",
    "",
    "Best wishes,",
    "Team KelasaHub",
    `${SITE.phoneDisplay} · ${SITE.email}`,
    OFFICE.address,
  ].join("\n");
  return { subject, text };
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

type MailResult = { ok: true } | { ok: false; error: string };

async function send(to: string, subject: string, text: string, html?: string): Promise<MailResult> {
  try {
    await transport().sendMail({ from: process.env.SMTP_FROM || SITE.email, to, subject, text, html });
    return { ok: true };
  } catch (e) {
    console.error("[mail] send failed:", e);
    return { ok: false, error: `Email failed: ${e instanceof Error ? e.message : "unknown error"}` };
  }
}

export async function sendSelectionEmail(c: SelectionCandidate): Promise<MailResult> {
  if (!mailConfigured()) return { ok: false, error: "Email isn't configured (SMTP_* env vars). Use “Open in mail app” instead." };
  const { subject, text } = selectionEmail(c);
  return send(c.email, subject, text);
}

/**
 * Sends a verification code. Without SMTP settings in development the code is
 * printed to the server console instead, so the flow can be tested locally.
 */
export async function sendOtpEmail(to: string, code: string, purpose: "apply" | "status"): Promise<MailResult> {
  const what = purpose === "apply" ? "confirm your email for your job application" : "check your application status";
  const subject = `${code} is your KelasaHub verification code`;
  const text = [
    `Your KelasaHub verification code is ${code}`,
    "",
    `Use it to ${what}. It expires in 10 minutes.`,
    "",
    "If you didn't request this, you can ignore this email.",
    "KelasaHub never asks candidates for money.",
    "",
    `Team KelasaHub · ${SITE.phoneDisplay}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f0;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0b1f3a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border:2px solid #0b1f3a;border-radius:20px;overflow:hidden">
      <tr><td style="background:#0b1f3a;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">Kelasa<span style="color:#14a39a">Hub</span></td></tr>
      <tr><td style="padding:28px">
        <p style="margin:0 0 8px;font-size:15px;color:#5b6b7f">Your verification code</p>
        <p style="margin:0 0 20px;font-size:40px;font-weight:800;letter-spacing:10px;color:#0b1f3a">${code}</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5">Use it to ${what}. It expires in <b>10 minutes</b>.</p>
        <p style="margin:0;padding:12px 14px;background:#fdf0d3;border-radius:12px;font-size:13px;line-height:1.5">Didn't request this? Ignore this email. KelasaHub never asks candidates for money.</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #e5e0d5;font-size:12px;color:#5b6b7f">${SITE.phoneDisplay} · ${SITE.email}</td></tr>
    </table>
  </td></tr></table></body></html>`;

  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[otp] ${purpose} code for ${to}: ${code}`);
      return { ok: true };
    }
    return { ok: false, error: "Email verification is temporarily unavailable. Please WhatsApp us instead." };
  }
  return send(to, subject, text, html);
}

/** Confirmation after applying, so the candidate keeps their Candidate ID. Best-effort. */
export async function sendApplicationConfirmation(c: { email: string; name: string; role: string; candidateId: string; pdfUrl?: string }) {
  const first = c.name.split(" ")[0];
  const subject = `Application received — ${c.role} (${c.candidateId})`;
  const track = `${SITE.url}/status?id=${encodeURIComponent(c.candidateId)}&email=${encodeURIComponent(c.email)}`;
  const text = [
    `Hi ${first},`,
    "",
    `Thanks for applying for ${c.role} through KelasaHub.`,
    `Your Candidate ID is ${c.candidateId} — keep it handy.`,
    "",
    "Our team will call you within a day for a short screening.",
    `Track your application anytime: ${track}`,
    ...(c.pdfUrl ? [`Download your application form (PDF, link valid 30 days): ${c.pdfUrl}`] : []),
    "",
    "KelasaHub never charges candidates. If anyone asks you for money in our name, please report it to us.",
    "",
    `Team KelasaHub · ${SITE.phoneDisplay} · ${SITE.email}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f0;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0b1f3a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:2px solid #0b1f3a;border-radius:20px;overflow:hidden">
      <tr><td style="background:#0b1f3a;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">Kelasa<span style="color:#14a39a">Hub</span></td></tr>
      <tr><td style="padding:28px">
        <p style="margin:0 0 6px;font-size:22px;font-weight:700">You're in, ${first}! 🎉</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#5b6b7f">We received your application for <b style="color:#0b1f3a">${c.role}</b>.</p>
        <div style="border:2px dashed #14a39a;border-radius:14px;padding:14px 18px;margin:0 0 20px">
          <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5b6b7f">Candidate ID</p>
          <p style="margin:4px 0 0;font-size:26px;font-weight:800;letter-spacing:1px">${c.candidateId}</p>
        </div>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5">Our team will call you within <b>a day</b> for a short screening.</p>
        <a href="${track}" style="display:inline-block;background:#f6b93b;color:#0b1f3a;border:2px solid #0b1f3a;border-radius:999px;padding:12px 22px;font-weight:700;text-decoration:none">Track my application</a>
        ${c.pdfUrl ? `<a href="${c.pdfUrl}" style="display:inline-block;margin-left:8px;background:#ffffff;color:#0b1f3a;border:2px solid #0b1f3a;border-radius:999px;padding:12px 22px;font-weight:700;text-decoration:none">Download application PDF</a>` : ""}
        <p style="margin:24px 0 0;padding:12px 14px;background:#fdf0d3;border-radius:12px;font-size:13px;line-height:1.5">KelasaHub never charges candidates. If anyone asks you for money in our name, please report it to us.</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #e5e0d5;font-size:12px;color:#5b6b7f">${SITE.phoneDisplay} · ${SITE.email}</td></tr>
    </table>
  </td></tr></table></body></html>`;

  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") console.log(`[mail] confirmation for ${c.email}: ${c.candidateId}`);
    return { ok: true } as const;
  }
  return send(c.email, subject, text, html);
}
