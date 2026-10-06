import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "./db";
import { Otp } from "./models";

export type OtpPurpose = "apply" | "status";

const CODE_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 45_000;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

const hash = (email: string, purpose: string, code: string) =>
  createHmac("sha256", secret()).update(`${purpose}:${email}:${code}`).digest("hex");

export type IssueResult = { ok: true; code: string } | { ok: false; error: string; retryAfter?: number };

/** Creates a new 6-digit code, enforcing a resend cooldown and an hourly cap per email. */
export async function issueOtp(email: string, purpose: OtpPurpose): Promise<IssueResult> {
  await connectDB();
  const recent = await Otp.find({ email, purpose, createdAt: { $gte: new Date(Date.now() - 3600_000) } })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();
  if (recent.length >= MAX_PER_HOUR) {
    return { ok: false, error: "Too many codes requested for this email. Please try again in an hour." };
  }
  const last = recent[0]?.createdAt ? new Date(recent[0].createdAt).getTime() : 0;
  const wait = last + RESEND_COOLDOWN_MS - Date.now();
  if (wait > 0) {
    const retryAfter = Math.ceil(wait / 1000);
    return { ok: false, error: `Please wait ${retryAfter}s before requesting another code.`, retryAfter };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  // A new code replaces any earlier unused one.
  await Otp.updateMany({ email, purpose, used: false }, { $set: { used: true } });
  await Otp.create({ email, purpose, codeHash: hash(email, purpose, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) });
  return { ok: true, code };
}

/** Checks a code. Each code allows a limited number of attempts and works once. */
export async function checkOtp(email: string, purpose: OtpPurpose, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB();
  const otp = await Otp.findOne({ email, purpose, used: false }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This code has expired. Request a new one." };
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many wrong attempts. Request a new code." };
  }
  const given = Buffer.from(hash(email, purpose, code.trim()));
  const expected = Buffer.from(otp.codeHash);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    otp.attempts += 1;
    await otp.save();
    const left = MAX_ATTEMPTS - otp.attempts;
    return { ok: false, error: left > 0 ? `That code isn't right — ${left} attempt${left > 1 ? "s" : ""} left.` : "Too many wrong attempts. Request a new code." };
  }
  otp.used = true;
  await otp.save();
  return { ok: true };
}

/* Short-lived proof that an email was verified, handed to the browser after a correct code. */
const tokenKey = () => new TextEncoder().encode(`${secret()}:email-verified`);

export async function signEmailToken(email: string, purpose: OtpPurpose) {
  return new SignJWT({ email, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("45m")
    .sign(tokenKey());
}

export async function verifyEmailToken(token: string | undefined, email: string, purpose: OtpPurpose) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, tokenKey());
    return payload.email === email && payload.purpose === purpose;
  } catch {
    return false;
  }
}
