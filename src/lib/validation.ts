import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, ""))
  .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number");

const optionalText = (max = 200) => z.string().trim().max(max).optional().default("");

export const applySchema = z.object({
  source: z.enum(["Job Application Form", "Talent Pool", "Chatbot"]),
  role: z.string().trim().min(2).max(120),
  jobId: z.string().optional().default(""),
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone,
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  // Proof of email verification from /api/otp/verify.
  consent: z.literal(true, { error: "Please agree to the Privacy Policy to continue" }),
  emailToken: z.string({ error: "Please verify your email first" }).min(10, "Please verify your email first"),
  nationality: optionalText(60),
  address: optionalText(300),
  pincode: z.union([z.literal(""), z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits")]).default(""),
  area: optionalText(60),
  languages: z.array(z.string().max(30)).max(10).optional().default([]),
  intlLanguages: z.array(z.string().max(30)).max(5).optional().default([]),
  employmentStatus: z.enum(["Fresher", "Experienced", ""]).optional().default(""),
  experienceLevel: optionalText(30),
  expYears: optionalText(20),
  lastCompany: optionalText(100),
  shiftPreference: z.enum(["Day Shift", "Night Shift", "Rotational", "Either", ""]).optional().default(""),
  targetSalary: optionalText(40),
  education: z
    .object({
      tenth: optionalText(150),
      twelfth: optionalText(150),
      graduate: optionalText(150),
      postGraduate: optionalText(150),
    })
    .optional()
    .default({ tenth: "", twelfth: "", graduate: "", postGraduate: "" }),
  // Honeypot: real people never fill this hidden field.
  website: z.string().optional().default(""),
});
export type ApplyInput = z.input<typeof applySchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  company: z.string().trim().min(2, "Please enter your company name").max(120),
  designation: z.string().trim().min(2, "Please enter your designation").max(100),
  businessType: z.string().trim().max(60).default(""),
  phone: z.union([z.literal(""), phone]).default(""),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).default(""),
  headcount: z.string().trim().max(40).default(""),
  message: z.string().trim().max(1000).default(""),
  website: z.string().optional().default(""),
});

const email = z.string().trim().toLowerCase().email("Enter a valid email address");
const candidateId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{1,5}-[\d-]{2,14}$/, "Candidate ID looks like K-2026-0123");

export const otpSendSchema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("apply"), email }),
  z.object({ purpose: z.literal("status"), email, candidateId }),
  z.object({ purpose: z.literal("login"), email }),
]);

export const otpVerifySchema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("apply"), email, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") }),
  z.object({ purpose: z.literal("status"), email, candidateId, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") }),
  z.object({ purpose: z.literal("login"), email, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") }),
]);

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid input";
}
