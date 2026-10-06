/**
 * Seeds partners, the current job openings and the first admin user.
 * Safe to re-run: existing records (matched by name / slug / email) are left alone.
 *
 *   npm run seed
 */
import "./env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Job, Partner, User } from "../src/lib/models";

const PARTNERS = [
  { name: "Nex-Gen", location: "HBR Layout, Bangalore" },
  { name: "Expert Callers", location: "Bangalore" },
  { name: "Sowtech", location: "Bangalore" },
  { name: "Washohub.in", location: "Bangalore" },
  { name: "Zlaark", location: "Bangalore" },
  { name: "JoAji Innovation", location: "Bangalore" },
];

const JOBS = [
  {
    title: "Telecallers (Agent Level)",
    salary: "Up to ₹18,000/month + incentives",
    salaryMax: 18000,
    description: "Start your career and grow with us by providing excellent service to our clients.",
    requirements:
      "Good communication skills; freshers & experienced welcome. Fluency in Kannada, Tamil, Telugu, Hindi or Malayalam required.",
    image: "/assets/telecallers.jpeg",
  },
  {
    title: "HR Recruiter",
    salary: "Up to ₹30,000/month",
    salaryMax: 30000,
    description: "Find top talent, build high-performing teams, and drive our company's success.",
    requirements: "Minimum 1 year of experience in HR recruitment required.",
    image: "/assets/hr-recruiter.jpeg",
  },
  {
    title: "QA Executive",
    salary: "Up to ₹30,000/month",
    salaryMax: 30000,
    description: "Ensure quality standards, provide actionable coaching, and drive excellence in our operations.",
    requirements: "Relevant experience in auditing telecaller calls is required.",
    image: "/assets/qa-executive.jpeg",
  },
  {
    title: "Team Leader",
    salary: "Up to ₹30,000/month",
    salaryMax: 30000,
    description: "Lead and manage our telecallers collections team, monitor performance, and inspire growth.",
    requirements: "Relevant experience in handling telecaller collections teams is required.",
    image: "/assets/team-leader.jpeg",
  },
  {
    title: "Process Trainer",
    salary: "Up to ₹25,000/month",
    salaryMax: 25000,
    description: "Design, deliver and assess training programs to transform team performance.",
    requirements:
      "1–2 years of experience in Process Training (BPO/Non-Voice preferred) with strong knowledge of training methodologies.",
    image: "/assets/process-trainer.jpeg",
  },
  {
    title: "Assistant Manager – Sales Team (For NBFC)",
    salary: "Up to ₹60,000/month (CTC) + bonuses",
    salaryMax: 60000,
    description: "Strategize, lead the sales team, and drive revenue growth in the NBFC sector.",
    requirements: "2–5 years of sales experience (NBFC/BFSI preferred) with proven target achievement.",
    image: "/assets/assistant-manager-sales.jpeg",
  },
  {
    title: "French & Spanish Language Advisor",
    salary: "₹50,000/month + attractive incentives",
    salaryMax: 50000,
    description:
      "Talk. Connect. Help. Grow. Communicate with international customers in French & Spanish and build a global career.",
    requirements:
      "Fluency in French or Spanish (spoken & written) with good English communication skills. Strong customer service and problem-solving abilities required. Freshers & experienced candidates welcome.",
    image: "/assets/french-spanish-advisor.jpeg",
    location: "Kothnur, Bangalore",
  },
];

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  for (const p of PARTNERS) {
    await Partner.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  }
  const nexgen = await Partner.findOne({ name: "Nex-Gen" });

  for (const [i, j] of JOBS.entries()) {
    const slug = slugify(j.title);
    await Job.updateOne(
      { slug },
      { $setOnInsert: { ...j, slug, partner: nexgen?._id, order: i, location: j.location ?? "HBR Layout, Bangalore" } },
      { upsert: true },
    );
  }

  const email = (process.env.ADMIN_EMAIL || "admin@kelasahub.in").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  if (!(await User.exists({ email }))) {
    await User.create({ name: "Admin", email, passwordHash: await bcrypt.hash(password, 10), role: "admin" });
    console.log(`Created admin ${email} (password from ADMIN_PASSWORD${process.env.ADMIN_PASSWORD ? "" : ' — default "ChangeMe@123", change it!'})`);
  }

  console.log(`Seeded: ${await Partner.countDocuments()} partners, ${await Job.countDocuments()} jobs, ${await User.countDocuments()} users`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
