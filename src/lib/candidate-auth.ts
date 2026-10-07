import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Candidate sign-in (email + one-time code). Kept apart from the admin session:
// its own cookie and a derived signing key, so a candidate token can never pass as an admin one.
export const CANDIDATE_COOKIE = "kh_candidate";
const REMEMBER_DAYS = 30;

export type CandidateSession = { email: string; kind: "candidate" };

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(`${s}:candidate-session`);
};

/**
 * `remember` keeps the candidate signed in for 30 days (explicit sign-in). Without it the
 * cookie ends with the browser session — used after applying or checking status, which
 * often happens on shared phones or at cyber cafés.
 */
export async function signInCandidate(email: string, remember: boolean) {
  const token = await new SignJWT({ email, kind: "candidate" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REMEMBER_DAYS}d`)
    .sign(key());
  (await cookies()).set(CANDIDATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: REMEMBER_DAYS * 86_400 } : {}),
  });
}

export async function signOutCandidate() {
  (await cookies()).delete(CANDIDATE_COOKIE);
}

export async function getCandidateSession(): Promise<CandidateSession | null> {
  const token = (await cookies()).get(CANDIDATE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload.kind === "candidate" && typeof payload.email === "string" ? { email: payload.email, kind: "candidate" } : null;
  } catch {
    return null;
  }
}
