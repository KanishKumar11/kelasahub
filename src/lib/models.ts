import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";
import {
  ATTRITION,
  EMPLOYMENT_STATUS,
  INTERVIEW_STATUS,
  LEAD_STATUS,
  OVERALL_STATUS,
  QUALITY,
  SCREENING_STATUS,
  SHIFT_PREFERENCE,
  TRAINING,
} from "./constants";

// Reuse compiled models across hot reloads.
const make = {
  Partner: () => model("Partner", partnerSchema),
  Job: () => model("Job", jobSchema),
  Candidate: () => model("Candidate", candidateSchema),
  Lead: () => model("Lead", leadSchema),
  User: () => model("User", userSchema),
  Media: () => model("Media", mediaSchema),
  Counter: () => model("Counter", counterSchema),
  Otp: () => model("Otp", otpSchema),
};
function getModel<K extends keyof typeof make>(name: K): ReturnType<(typeof make)[K]> {
  return (models[name] ?? make[name]()) as ReturnType<(typeof make)[K]>;
}

/* ---------------------------------- Partner --------------------------------- */
// Hiring companies (BPO partners) that KelasaHub places candidates with.
const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "" }, // e.g. "HBR Layout, Bangalore"
    address: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    showOnSite: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export type PartnerDoc = InferSchemaType<typeof partnerSchema> & { _id: mongoose.Types.ObjectId };
export const Partner = getModel("Partner");

/* ------------------------------------ Job ----------------------------------- */
const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    partner: { type: Schema.Types.ObjectId, ref: "Partner", default: null },
    salary: { type: String, default: "" }, // display text, e.g. "Up to ₹18,000/month + incentives"
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    location: { type: String, default: "HBR Layout, Bangalore" },
    employmentType: { type: String, default: "FULL_TIME" },
    openings: { type: Number, default: null },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export type JobDoc = InferSchemaType<typeof jobSchema> & { _id: mongoose.Types.ObjectId };
export const Job = getModel("Job");

/* --------------------------------- Candidate -------------------------------- */
const activitySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    by: { type: String, default: "System" },
    type: { type: String, default: "note" }, // note | status | call | email | system
    text: { type: String, required: true },
  },
  { _id: true },
);

const candidateSchema = new Schema(
  {
    candidateId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    emailVerifiedAt: { type: Date, default: null },
    source: { type: String, default: "Job Application Form" },
    partner: { type: Schema.Types.ObjectId, ref: "Partner", default: null },
    job: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    role: { type: String, default: "" },
    area: { type: String, default: "" },
    dateApplied: { type: Date, default: Date.now, index: true },

    // Application-form details (used in the PDF)
    nationality: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    languages: { type: [String], default: [] },
    intlLanguages: { type: [String], default: [] },
    employmentStatus: { type: String, enum: [...EMPLOYMENT_STATUS, ""], default: "" },
    experienceLevel: { type: String, default: "" },
    expYears: { type: String, default: "" },
    lastCompany: { type: String, default: "" },
    education: {
      tenth: { type: String, default: "" },
      twelfth: { type: String, default: "" },
      graduate: { type: String, default: "" },
      postGraduate: { type: String, default: "" },
    },
    referredBy: { type: String, default: "KelasaHub" },

    // Pipeline (mirrors the spreadsheet columns)
    screeningStatus: { type: String, enum: SCREENING_STATUS, default: "New", index: true },
    interviewStatus: { type: String, enum: INTERVIEW_STATUS, default: "Not Scheduled" },
    interviewDate: { type: Date, default: null },
    overallStatus: { type: String, enum: [...OVERALL_STATUS, ""], default: "" },
    quality: { type: String, enum: [...QUALITY, ""], default: "" },
    shiftPreference: { type: String, enum: [...SHIFT_PREFERENCE, ""], default: "" },
    targetSalary: { type: String, default: "" },
    dateSelected: { type: Date, default: null },
    joiningDate: { type: Date, default: null },
    firstMonthAttrition: { type: String, enum: [...ATTRITION, ""], default: "" },
    trainingGraduation: { type: String, enum: [...TRAINING, ""], default: "" },
    lastContacted: { type: Date, default: null },
    notes: { type: String, default: "" },
    selectionEmailSent: { type: Boolean, default: false },
    selectionEmailSentAt: { type: Date, default: null },

    activity: { type: [activitySchema], default: [] },
  },
  { timestamps: true },
);
candidateSchema.index({ name: "text", email: "text", phone: "text", candidateId: "text", role: "text" });

export type CandidateDoc = InferSchemaType<typeof candidateSchema> & { _id: mongoose.Types.ObjectId };
export const Candidate = getModel("Candidate");

/** Days from application to selection — the spreadsheet's "Time to Fill". */
export function timeToFill(c: { dateApplied?: Date | null; dateSelected?: Date | null }) {
  if (!c.dateApplied || !c.dateSelected) return null;
  const days = Math.round(
    (new Date(c.dateSelected).getTime() - new Date(c.dateApplied).getTime()) / 86_400_000,
  );
  return Math.max(0, days);
}

/* ------------------------------- Business lead ------------------------------ */
const leadSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    designation: { type: String, default: "" },
    businessType: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    headcount: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, enum: LEAD_STATUS, default: "New" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);
export type LeadDoc = InferSchemaType<typeof leadSchema> & { _id: mongoose.Types.ObjectId };
export const Lead = getModel("Lead");

/* ---------------------------------- Users ----------------------------------- */
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "recruiter"], default: "recruiter" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);
export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = getModel("User");

/* ------------------------------ Media (uploads) ----------------------------- */
// Job images uploaded from the admin panel. Stored in Mongo so the app works on
// any host (Netlify/Vercel have no persistent disk).
const mediaSchema = new Schema(
  {
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer,
  },
  { timestamps: true },
);
export const Media = getModel("Media");

/* -------------------------------- Email OTPs -------------------------------- */
// One-time codes for email verification. Only a hash of the code is stored;
// MongoDB's TTL index deletes documents an hour after creation.
const otpSchema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  purpose: { type: String, enum: ["apply", "status"], required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});
export const Otp = getModel("Otp");

/* --------------------------------- Counters --------------------------------- */
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
export const Counter = getModel("Counter");

/**
 * Sequential, collision-free candidate IDs: K-2026-0001, K-2026-0002 …
 * (the old site generated random 3-digit IDs, which collide after a few hundred applicants).
 */
export async function nextCandidateId(date = new Date()) {
  const year = date.getFullYear();
  const c = await Counter.findOneAndUpdate(
    { _id: `candidate-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return `K-${year}-${String(c!.seq).padStart(4, "0")}`;
}
