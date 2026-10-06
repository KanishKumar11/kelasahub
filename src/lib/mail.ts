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

export async function sendSelectionEmail(c: SelectionCandidate): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!mailConfigured()) return { ok: false, error: "Email isn't configured (SMTP_* env vars). Use “Open in mail app” instead." };
  const { subject, text } = selectionEmail(c);
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from: process.env.SMTP_FROM || SITE.email, to: c.email, subject, text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Email failed: ${e instanceof Error ? e.message : "unknown error"}` };
  }
}
