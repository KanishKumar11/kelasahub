"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, requireSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Candidate, Job, Lead, Partner, User, nextCandidateId } from "@/lib/models";
import {
  ATTRITION,
  INTERVIEW_STATUS,
  LEAD_STATUS,
  OVERALL_STATUS,
  QUALITY,
  SCREENING_STATUS,
  SHIFT_PREFERENCE,
  TRAINING,
} from "@/lib/constants";
import { sendSelectionEmail } from "@/lib/mail";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/* ---------------------------------- Auth ----------------------------------- */

export async function loginAction(_: unknown, form: FormData): Promise<{ error: string } | void> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");
  await connectDB();

  // First run with an empty database: bootstrap the admin from env vars.
  if ((await User.estimatedDocumentCount()) === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "admin",
    });
  }

  const user = await User.findOne({ email, isActive: true });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  user.lastLoginAt = new Date();
  await user.save();
  await createSession({ uid: String(user._id), name: user.name, email: user.email, role: user.role as "admin" | "recruiter" });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* -------------------------------- Candidates -------------------------------- */

const PIPELINE_FIELDS = {
  screeningStatus: SCREENING_STATUS,
  interviewStatus: INTERVIEW_STATUS,
  overallStatus: OVERALL_STATUS,
  quality: QUALITY,
  shiftPreference: SHIFT_PREFERENCE,
  firstMonthAttrition: ATTRITION,
  trainingGraduation: TRAINING,
} as const;
type PipelineField = keyof typeof PIPELINE_FIELDS;

const LABELS: Record<string, string> = {
  screeningStatus: "Screening",
  interviewStatus: "Interview",
  overallStatus: "Overall status",
  quality: "Quality",
  shiftPreference: "Shift preference",
  firstMonthAttrition: "First-month attrition",
  trainingGraduation: "Training",
};

/** Inline dropdown change from the table or detail page. Logs the change to the timeline. */
export async function setCandidateField(id: string, field: PipelineField, value: string): Promise<ActionResult> {
  const s = await requireSession();
  const allowed = PIPELINE_FIELDS[field] as readonly string[] | undefined;
  if (!allowed || (value !== "" && !allowed.includes(value))) return { ok: false, error: "Invalid value" };
  await connectDB();
  const c = await Candidate.findById(id);
  if (!c) return { ok: false, error: "Candidate not found" };
  const before = c.get(field);
  if (before === value) return { ok: true };
  c.set(field, value);
  if (field === "overallStatus" && value === "Selected" && !c.dateSelected) c.dateSelected = new Date();
  if (field === "screeningStatus" && value === "Rejected" && !c.overallStatus) c.overallStatus = "Rejected";
  c.activity.push({ by: s.name, type: "status", text: `${LABELS[field]}: ${before || "—"} → ${value || "—"}` });
  await c.save();
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const optDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : null));

const candidateFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, ""))
    .refine((v) => /^\d{10}$/.test(v), "Phone must be 10 digits"),
  email: z.string().trim().toLowerCase().default(""),
  source: z.string().default("Manual Entry"),
  role: z.string().trim().default(""),
  partner: z.string().default(""),
  area: z.string().default(""),
  nationality: z.string().default(""),
  address: z.string().default(""),
  pincode: z.string().default(""),
  languages: z.string().default(""),
  employmentStatus: z.enum(["", "Fresher", "Experienced"]).default(""),
  expYears: z.string().default(""),
  lastCompany: z.string().default(""),
  targetSalary: z.string().default(""),
  referredBy: z.string().default("KelasaHub"),
  edu_tenth: z.string().default(""),
  edu_twelfth: z.string().default(""),
  edu_graduate: z.string().default(""),
  edu_postGraduate: z.string().default(""),
  // Pipeline fields are optional: the edit form leaves them to the inline dropdowns.
  screeningStatus: z.enum(SCREENING_STATUS).optional(),
  interviewStatus: z.enum(INTERVIEW_STATUS).optional(),
  overallStatus: z.enum([...OVERALL_STATUS, ""]).optional(),
  quality: z.enum([...QUALITY, ""]).optional(),
  shiftPreference: z.enum([...SHIFT_PREFERENCE, ""]).optional(),
  firstMonthAttrition: z.enum([...ATTRITION, ""]).optional(),
  trainingGraduation: z.enum([...TRAINING, ""]).optional(),
  interviewDate: optDate,
  dateSelected: optDate,
  joiningDate: optDate,
  lastContacted: optDate,
  notes: z.string().default(""),
});

function formToObject(form: FormData) {
  const o: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") o[k] = v;
  return o;
}

export async function saveCandidate(id: string | null, _: unknown, form: FormData): Promise<ActionResult> {
  const s = await requireSession();
  const parsed = candidateFormSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  await connectDB();

  const pipeline = Object.fromEntries(
    (Object.keys(PIPELINE_FIELDS) as PipelineField[]).filter((k) => d[k] !== undefined).map((k) => [k, d[k]]),
  ) as Partial<Record<PipelineField, string>>;

  const doc = {
    ...pipeline,
    name: d.name,
    phone: d.phone,
    email: d.email,
    source: d.source,
    role: d.role,
    partner: /^[a-f0-9]{24}$/.test(d.partner) ? d.partner : null,
    area: d.area,
    nationality: d.nationality,
    address: d.address,
    pincode: d.pincode,
    languages: d.languages.split(",").map((x) => x.trim()).filter(Boolean),
    employmentStatus: d.employmentStatus,
    expYears: d.expYears,
    lastCompany: d.lastCompany,
    targetSalary: d.targetSalary,
    referredBy: d.referredBy,
    education: { tenth: d.edu_tenth, twelfth: d.edu_twelfth, graduate: d.edu_graduate, postGraduate: d.edu_postGraduate },
    interviewDate: d.interviewDate,
    dateSelected: d.dateSelected ?? (d.overallStatus === "Selected" ? new Date() : null),
    joiningDate: d.joiningDate,
    lastContacted: d.lastContacted,
    notes: d.notes,
  };

  if (id) {
    const c = await Candidate.findById(id);
    if (!c) return { ok: false, error: "Candidate not found" };
    const changes = (Object.keys(pipeline) as PipelineField[])
      .filter((k) => (c.get(k) ?? "") !== (pipeline[k] ?? ""))
      .map((k) => `${LABELS[k]}: ${c.get(k) || "—"} → ${pipeline[k] || "—"}`);
    // Keep an existing selection date when the form leaves it blank.
    if (!d.dateSelected && c.dateSelected) doc.dateSelected = c.dateSelected;
    c.set(doc);
    c.activity.push({ by: s.name, type: changes.length ? "status" : "system", text: changes.length ? changes.join(" · ") : "Profile details updated" });
    await c.save();
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Saved" };
  }

  const candidateId = await nextCandidateId();
  const created = new Candidate({
    ...doc,
    candidateId,
    activity: [{ by: s.name, type: "system", text: `Added manually (${d.source})` }],
  });
  await created.save();
  revalidatePath("/admin", "layout");
  redirect(`/admin/candidates/${created._id}`);
}

export async function addNote(id: string, text: string, type: "note" | "call" = "note"): Promise<ActionResult> {
  const s = await requireSession();
  const t = text.trim();
  if (!t) return { ok: false, error: "Write something first" };
  await connectDB();
  await Candidate.updateOne(
    { _id: id },
    {
      $push: { activity: { by: s.name, type, text: t, at: new Date() } },
      ...(type === "call" ? { $set: { lastContacted: new Date() } } : {}),
    },
  );
  revalidatePath(`/admin/candidates/${id}`);
  return { ok: true };
}

export async function deleteCandidate(id: string) {
  await requireSession("admin");
  await connectDB();
  await Candidate.deleteOne({ _id: id });
  revalidatePath("/admin", "layout");
  redirect("/admin/candidates");
}

export async function bulkUpdate(
  ids: string[],
  update: { field: PipelineField | "partner"; value: string } | { delete: true },
): Promise<ActionResult> {
  const s = await requireSession();
  if (!ids.length) return { ok: false, error: "Select candidates first" };
  await connectDB();
  if ("delete" in update) {
    if (s.role !== "admin") return { ok: false, error: "Only admins can delete" };
    await Candidate.deleteMany({ _id: { $in: ids } });
  } else if (update.field === "partner") {
    await Candidate.updateMany({ _id: { $in: ids } }, { $set: { partner: update.value || null } });
  } else {
    const allowed = PIPELINE_FIELDS[update.field] as readonly string[];
    if (!allowed.includes(update.value)) return { ok: false, error: "Invalid value" };
    const set: Record<string, unknown> = { [update.field]: update.value };
    if (update.field === "overallStatus" && update.value === "Selected") set.dateSelected = new Date();
    await Candidate.updateMany(
      { _id: { $in: ids } },
      {
        $set: set,
        $push: { activity: { by: s.name, type: "status", text: `${LABELS[update.field]} → ${update.value} (bulk)`, at: new Date() } },
      },
    );
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: `Updated ${ids.length} candidate${ids.length > 1 ? "s" : ""}` };
}

export async function markSelectionEmail(id: string, send: boolean): Promise<ActionResult> {
  const s = await requireSession();
  await connectDB();
  const c = await Candidate.findById(id).populate<{ partner: { name: string; location: string; address: string } | null }>("partner");
  if (!c) return { ok: false, error: "Candidate not found" };
  if (send) {
    if (!c.email) return { ok: false, error: "This candidate has no email address" };
    const r = await sendSelectionEmail(c);
    if (!r.ok) return { ok: false, error: r.error };
  }
  c.selectionEmailSent = true;
  c.selectionEmailSentAt = new Date();
  c.activity.push({ by: s.name, type: "email", text: send ? `Selection email sent to ${c.email}` : "Marked selection email as sent" });
  await c.save();
  revalidatePath(`/admin/candidates/${id}`);
  return { ok: true, message: send ? "Email sent" : "Marked as sent" };
}

/* ----------------------------------- Jobs ----------------------------------- */

const jobSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z.string().trim().default(""),
  partner: z.string().default(""),
  salary: z.string().trim().default(""),
  salaryMin: z.string().default(""),
  salaryMax: z.string().default(""),
  description: z.string().trim().default(""),
  requirements: z.string().trim().default(""),
  location: z.string().trim().default(""),
  openings: z.string().default(""),
  workMode: z.enum(["onsite", "remote", "hybrid"]).default("onsite"),
  shifts: z.string().default(""),
  shiftStart: z.string().trim().default(""),
  shiftEnd: z.string().trim().default(""),
  image: z.string().trim().default(""),
  order: z.string().default("0"),
  isActive: z.string().optional(),
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (v: string) => (v.trim() === "" || isNaN(Number(v)) ? null : Number(v));

export async function saveJob(id: string | null, _: unknown, form: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = jobSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  await connectDB();
  const slug = slugify(d.slug || d.title);
  const clash = await Job.findOne({ slug, ...(id ? { _id: { $ne: id } } : {}) });
  if (clash) return { ok: false, error: `Another job already uses the URL “${slug}”` };
  const doc = {
    title: d.title,
    slug,
    partner: /^[a-f0-9]{24}$/.test(d.partner) ? d.partner : null,
    salary: d.salary,
    salaryMin: num(d.salaryMin),
    salaryMax: num(d.salaryMax),
    description: d.description,
    requirements: d.requirements,
    location: d.location,
    openings: num(d.openings),
    workMode: d.workMode,
    shifts: num(d.shifts),
    shiftStart: d.shiftStart,
    shiftEnd: d.shiftEnd,
    image: d.image,
    order: num(d.order) ?? 0,
    isActive: d.isActive === "on",
  };
  if (id) await Job.updateOne({ _id: id }, { $set: doc });
  else await Job.create(doc);
  revalidatePath("/", "layout");
  redirect("/admin/jobs");
}

export async function toggleJob(id: string, isActive: boolean): Promise<ActionResult> {
  await requireSession();
  await connectDB();
  await Job.updateOne({ _id: id }, { $set: { isActive } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteJob(id: string) {
  await requireSession("admin");
  await connectDB();
  await Job.deleteOne({ _id: id });
  revalidatePath("/", "layout");
  redirect("/admin/jobs");
}

/* --------------------------------- Partners --------------------------------- */

export async function savePartner(id: string | null, _: unknown, form: FormData): Promise<ActionResult> {
  await requireSession();
  const o = formToObject(form);
  const name = (o.name || "").trim();
  if (name.length < 2) return { ok: false, error: "Name is required" };
  await connectDB();
  const doc = {
    name,
    location: o.location?.trim() ?? "",
    address: o.address?.trim() ?? "",
    contactPerson: o.contactPerson?.trim() ?? "",
    phone: o.phone?.trim() ?? "",
    email: o.email?.trim() ?? "",
    showOnSite: o.showOnSite === "on",
    isActive: o.isActive === "on",
  };
  if (id) await Partner.updateOne({ _id: id }, { $set: doc });
  else await Partner.create(doc);
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved" };
}

export async function deletePartner(id: string): Promise<ActionResult> {
  await requireSession("admin");
  await connectDB();
  const used = (await Candidate.countDocuments({ partner: id })) + (await Job.countDocuments({ partner: id }));
  if (used) return { ok: false, error: `In use by ${used} job(s)/candidate(s) — mark it inactive instead` };
  await Partner.deleteOne({ _id: id });
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------------------------- Leads ----------------------------------- */

export async function updateLead(id: string, patch: { status?: string; notes?: string }): Promise<ActionResult> {
  await requireSession();
  if (patch.status && !(LEAD_STATUS as readonly string[]).includes(patch.status)) return { ok: false, error: "Invalid status" };
  await connectDB();
  await Lead.updateOne({ _id: id }, { $set: patch });
  revalidatePath("/admin/leads");
  return { ok: true };
}

/* ---------------------------------- Users ----------------------------------- */

export async function saveUser(_: unknown, form: FormData): Promise<ActionResult> {
  await requireSession("admin");
  const o = formToObject(form);
  const email = (o.email || "").trim().toLowerCase();
  if (!o.name?.trim() || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Name and a valid email are required" };
  if ((o.password || "").length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  await connectDB();
  if (await User.exists({ email })) return { ok: false, error: "A user with that email already exists" };
  await User.create({
    name: o.name.trim(),
    email,
    role: o.role === "admin" ? "admin" : "recruiter",
    passwordHash: await bcrypt.hash(o.password, 10),
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "User added" };
}

export async function updateUser(id: string, patch: { isActive?: boolean; role?: string; password?: string }): Promise<ActionResult> {
  const s = await requireSession("admin");
  if (id === s.uid && (patch.isActive === false || patch.role === "recruiter")) {
    return { ok: false, error: "You can't deactivate or demote yourself" };
  }
  await connectDB();
  const set: Record<string, unknown> = {};
  if (patch.isActive !== undefined) set.isActive = patch.isActive;
  if (patch.role) set.role = patch.role === "admin" ? "admin" : "recruiter";
  if (patch.password) {
    if (patch.password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
    set.passwordHash = await bcrypt.hash(patch.password, 10);
  }
  await User.updateOne({ _id: id }, { $set: set });
  revalidatePath("/admin/users");
  return { ok: true, message: "Updated" };
}

export async function changeOwnPassword(_: unknown, form: FormData): Promise<ActionResult> {
  const s = await requireSession();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters" };
  await connectDB();
  const u = await User.findById(s.uid);
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { ok: false, error: "Current password is incorrect" };
  u.passwordHash = await bcrypt.hash(next, 10);
  await u.save();
  return { ok: true, message: "Password changed" };
}
