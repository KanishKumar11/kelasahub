// Site-wide contact details and the dropdown values used by the admin pipeline.
// Status lists mirror the data-validation rules in "KelasaHub - Applications.xlsx".

export const SITE = {
  name: "KelasaHub",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kelasahub.in",
  tagline: "Free BPO & Call Centre Placements, Bangalore",
  description:
    "KelasaHub is a free-to-candidate job consultancy for Bangalore's call centre and BPO industry. No placement fees, ever.",
  email: "support@kelasahub.in",
  phoneDisplay: "+91 96069 06930",
  phoneTel: "+919606906930",
  whatsapp: "919606906930",
  instagram: "https://www.instagram.com/kelasahub?igsh=MTRqZ2s2cG41bXI0dA==",
  heroVideo:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4",
} as const;

export const OFFICE = {
  name: "KelasaHub Head Office",
  address:
    "42, Balaji St, Gurumurthy Reddy Layout, Ramamurthy Nagar, Bengaluru, Karnataka 560016",
  shortArea: "Ramamurthy Nagar, Bengaluru",
  // Official Google Business listing for KelasaHub.
  mapLink: "https://maps.app.goo.gl/ADY92pSy3XDb9uii9",
  mapEmbed:
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      "KelasaHub, 42, Balaji St, Gurumurthy Reddy Layout, Ramamurthy Nagar, Bengaluru, Karnataka 560016",
    ) +
    "&z=16&output=embed",
} as const;

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** WhatsApp link to an arbitrary candidate phone number (Indian numbers assumed). */
export function candidateWhatsApp(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Headline numbers shown on the website. Update these as hiring changes. */
export const HIRING_STATS = {
  openPositions: 240,
  payMin: 15_000,
  payMax: 75_000,
  partners: 6,
  callback: "within a day",
  // Candidates appointed at partner companies, and over what period.
  placed: 100,
  placedPeriod: "2 months",
};

export const SCREENING_STATUS = ["New", "In Review", "Shortlisted", "Rejected"] as const;
export const INTERVIEW_STATUS = [
  "Not Scheduled",
  "Scheduled",
  "Completed",
  "No Show",
  "Rescheduled",
] as const;
export const OVERALL_STATUS = ["In Progress", "Selected", "Rejected", "Dropped Out"] as const;
export const QUALITY = ["Poor", "Below Average", "Average", "Good", "Excellent"] as const;
export const SHIFT_PREFERENCE = ["Day Shift", "Night Shift", "Rotational", "Either"] as const;
export const ATTRITION = ["Retained", "Attrited", "Too Early to Tell"] as const;
export const TRAINING = ["Pending", "In Progress", "Graduated", "Dropped Out"] as const;
export const EMPLOYMENT_STATUS = ["Fresher", "Experienced"] as const;

export const SOURCES = [
  "Job Application Form",
  "Talent Pool",
  "Chatbot",
  "Resume Builder",
  "Walk-in",
  "Referral",
  "Phone Call",
  "Manual Entry",
] as const;

export const AREAS = [
  "Whitefield",
  "Electronic City",
  "Marathahalli",
  "Koramangala",
  "BTM Layout",
  "HBR Layout",
  "Ramamurthy Nagar",
  "KR Puram",
  "Other",
] as const;

export const EXPERIENCE_LEVELS = ["Fresher", "6mo-1yr", "1-3yrs", "3+yrs"] as const;
export const LANGUAGES = ["Kannada", "Tamil", "Telugu", "Malayalam", "Hindi", "English"] as const;
export const INTL_LANGUAGES = ["French", "Spanish"] as const;
export const TALENT_POOL_ROLES = [
  "Voice - Customer Support",
  "Technical Support",
  "Back Office",
  "Chat Support",
  "French/Spanish Language Advisor",
] as const;

export const BUSINESS_TYPES = [
  "BPO / Call Centre",
  "IT / Tech",
  "NBFC / Finance",
  "Retail / E-commerce",
  "Healthcare",
  "Hospitality",
  "Manufacturing",
  "Other",
] as const;
export const LEAD_STATUS = ["New", "Contacted", "Quoted", "Won", "Lost"] as const;

export const WORK_MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
] as const;

/** "13:30" → "1:30 PM" */
export function formatTime(t: string) {
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

export const SHIFT_TIMINGS = [
  "8:00 AM – 5:00 PM",
  "9:00 AM – 6:00 PM",
  "10:00 AM – 7:00 PM",
  "11:00 AM – 8:00 PM",
];

export const PROCESSES = [
  { emoji: "🥇", label: "Gold Loan Process", detail: "(Muthoot) — fast, minimal documentation" },
  { emoji: "📈", label: "Sales Process", detail: "(Muthoot)" },
  { emoji: "📋", label: "Collection Process", detail: "(Muthoot)" },
];

/** Friendly, candidate-facing description of where an application stands. */
export function publicStage(c: {
  screeningStatus: string;
  interviewStatus: string;
  overallStatus?: string | null;
  joiningDate?: Date | string | null;
}) {
  if (c.overallStatus === "Selected")
    return c.joiningDate
      ? { step: 4, label: "Selected — joining date confirmed" }
      : { step: 4, label: "Selected 🎉 — our team will share your joining date" };
  if (c.overallStatus === "Rejected" || c.screeningStatus === "Rejected")
    return {
      step: -1,
      label: "Not selected for this role — your profile stays active for other openings",
    };
  if (c.overallStatus === "Dropped Out") return { step: -1, label: "Application closed" };
  if (c.interviewStatus === "Completed") return { step: 3, label: "Interview completed — awaiting result" };
  if (c.interviewStatus === "Scheduled" || c.interviewStatus === "Rescheduled")
    return { step: 3, label: "Interview scheduled" };
  if (c.screeningStatus === "Shortlisted") return { step: 2, label: "Shortlisted — interview being arranged" };
  if (c.screeningStatus === "In Review") return { step: 1, label: "Profile under review" };
  return { step: 0, label: "Application received" };
}
