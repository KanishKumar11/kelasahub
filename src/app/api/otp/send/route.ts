import { NextResponse } from "next/server";
import { firstError, otpSendSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mail";
import { candidateEmailMatches } from "@/lib/status";

// POST { purpose: "apply", email } | { purpose: "status", email, candidateId }
export async function POST(req: Request) {
  if (!rateLimit(req, "otp-send", 6)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }
  const parsed = otpSendSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const d = parsed.data;

  // For status checks, only email the address on file — but answer the same way either way,
  // so the form can't be used to discover who has applied.
  if (d.purpose === "status" && !(await candidateEmailMatches(d.candidateId, d.email))) {
    return NextResponse.json({ ok: true });
  }

  const issued = await issueOtp(d.email, d.purpose);
  if (!issued.ok) {
    return NextResponse.json({ error: issued.error, retryAfter: issued.retryAfter }, { status: 429 });
  }
  const sent = await sendOtpEmail(d.email, issued.code, d.purpose);
  if (!sent.ok) return NextResponse.json({ error: "We couldn't send the email right now. Please try again or WhatsApp us." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
