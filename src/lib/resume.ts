// Resume builder data: the shape, validation and writing suggestions.
// Shared by the builder (browser), the PDF renderer and the save/download API routes.
import { z } from "zod";

const s = (max: number) => z.string().trim().max(max).default("");

export const ACCENTS = {
  teal: "#0e7c75",
  navy: "#0b1f3a",
  plum: "#6b2d5c",
  rust: "#b4532a",
} as const;
export type Accent = keyof typeof ACCENTS;

export const LANGUAGE_LEVELS = ["Native", "Fluent", "Conversational", "Basic"] as const;

const experience = z.object({
  role: s(80),
  company: s(80),
  location: s(60),
  start: s(20),
  end: s(20),
  current: z.boolean().default(false),
  // One achievement per line.
  points: s(1200),
});

const education = z.object({
  degree: s(100),
  school: s(120),
  year: s(20),
  score: s(30),
});

export const resumeSchema = z.object({
  accent: z.enum(Object.keys(ACCENTS) as [Accent, ...Accent[]]).default("teal"),
  name: s(80),
  headline: s(100),
  email: s(120),
  phone: s(20),
  location: s(80),
  summary: s(800),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  languages: z.array(z.object({ name: z.string().trim().min(1).max(30), level: z.enum(LANGUAGE_LEVELS).default("Fluent") })).max(10).default([]),
  experience: z.array(experience).max(8).default([]),
  education: z.array(education).max(6).default([]),
  certifications: s(600),
});

export type ResumeData = z.infer<typeof resumeSchema>;
export type Experience = ResumeData["experience"][number];
export type Education = ResumeData["education"][number];

export const emptyExperience = (): Experience => ({ role: "", company: "", location: "", start: "", end: "", current: false, points: "" });
export const emptyEducation = (): Education => ({ degree: "", school: "", year: "", score: "" });

export function emptyResume(seed: Partial<ResumeData> = {}): ResumeData {
  return {
    accent: "teal",
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "Bengaluru, Karnataka",
    summary: "",
    skills: [],
    languages: [],
    experience: [],
    education: [emptyEducation()],
    certifications: "",
    ...seed,
  };
}

/** Lines of an experience entry, without bullets or blanks. */
export const pointsOf = (e: Experience) =>
  e.points
    .split("\n")
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);

/* ------------------------------- Suggestions -------------------------------- */
// Starting points for people writing their first resume. Candidates edit them freely.

export const SKILL_SUGGESTIONS = [
  "Customer handling",
  "Inbound & outbound calls",
  "Clear communication",
  "Active listening",
  "Objection handling",
  "Sales & lead conversion",
  "Complaint resolution",
  "CRM tools",
  "MS Excel",
  "Typing 35+ WPM",
  "Email & chat support",
  "Data entry",
  "Collections & follow-ups",
  "Team leadership",
  "Call quality auditing",
  "Night shifts / rotational shifts",
];

export const SUMMARY_TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Fresher",
    text: "Motivated graduate with strong communication skills in English and regional languages. Quick learner, comfortable on the phone and keen to start a career in customer service. Available for rotational shifts and ready to join immediately.",
  },
  {
    label: "Telecaller / Sales",
    text: "Telecaller with experience in outbound sales and lead follow-up. Comfortable handling high call volumes, explaining products simply and converting interest into sales while keeping customers happy.",
  },
  {
    label: "Customer support",
    text: "Customer support executive experienced in resolving queries over voice, chat and email. Patient, solution-focused and consistent on quality scores and turnaround times.",
  },
  {
    label: "Team leader",
    text: "Team leader with hands-on BPO floor experience — coaching agents, tracking daily targets and improving quality and attendance. Known for keeping teams motivated through peak hours.",
  },
];

export const POINT_SUGGESTIONS = [
  "Handled 80+ inbound and outbound calls a day with a focus on first-call resolution",
  "Consistently met or exceeded monthly sales / collection targets",
  "Maintained quality audit scores above 90%",
  "Resolved customer complaints calmly and escalated only when needed",
  "Updated customer details and call notes accurately in the CRM",
  "Trained and supported new joiners during their first weeks on the floor",
];
