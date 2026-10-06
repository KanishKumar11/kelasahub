import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "../db";
import { Candidate } from "../models";
import { SITE } from "../constants";
import type { ApplicationData } from "./ApplicationForm";

/** Loads candidates (in application order) and maps them to the PDF's data shape. */
export async function loadApplications(ids: string[]) {
  await connectDB();
  const docs = await Candidate.find({ _id: { $in: ids } })
    .populate<{ partner: { name: string; location: string; address: string } | null }>("partner", "name location address")
    .sort({ dateApplied: 1 })
    .lean();

  const data: ApplicationData[] = docs.map((c) => ({
    candidateId: c.candidateId,
    name: c.name,
    phone: c.phone,
    email: c.email ?? "",
    role: c.role ?? "",
    nationality: c.nationality ?? "",
    address: c.address ?? "",
    pincode: c.pincode ?? "",
    area: c.area ?? "",
    languages: c.languages ?? [],
    intlLanguages: c.intlLanguages ?? [],
    employmentStatus: c.employmentStatus ?? "",
    expYears: c.expYears ?? "",
    lastCompany: c.lastCompany ?? "",
    shiftPreference: c.shiftPreference ?? "",
    targetSalary: c.targetSalary ?? "",
    education: c.education ?? {},
    referredBy: c.referredBy ?? "KelasaHub",
    dateApplied: c.dateApplied,
    partner: c.partner,
  }));
  return data;
}

export function applicationFilename(rows: ApplicationData[]) {
  if (rows.length !== 1) return `KelasaHub_Applications_${rows.length}.pdf`;
  const c = rows[0];
  return `${c.partner?.name ?? "KelasaHub"}_Application_${c.role}_${c.name}_${c.candidateId}.pdf`.replace(/\s+/g, "_");
}

/* ------------- Signed download links for candidates (no login needed) ------------- */

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(`${s}:application-pdf`);
};

/** A private link that downloads one candidate's own application form for 30 days. */
export async function applicationPdfPath(candidateMongoId: string) {
  const token = await new SignJWT({ cid: candidateMongoId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
  return `/api/application-pdf?t=${token}`;
}

export async function applicationPdfUrl(candidateMongoId: string) {
  return `${SITE.url}${await applicationPdfPath(candidateMongoId)}`;
}

export async function readApplicationPdfToken(token: string | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.cid === "string" && /^[a-f0-9]{24}$/.test(payload.cid) ? payload.cid : null;
  } catch {
    return null;
  }
}
