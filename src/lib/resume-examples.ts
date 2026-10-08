// Sample resumes for common call-centre roles. Each one powers an SEO landing page
// (/resume-builder/<slug>) and can be loaded into the builder as a starting point.
// The people are fictional; candidates replace every detail with their own.
import { emptyResume, type ResumeData } from "./resume";

export type ResumeExample = {
  slug: string;
  role: string; // used in titles: "<role> resume"
  searchTitle: string;
  intro: string;
  tips: string[];
  resume: ResumeData;
};

export const RESUME_EXAMPLES: ResumeExample[] = [
  {
    slug: "telecaller",
    role: "Telecaller",
    searchTitle: "Telecaller Resume Format & Example",
    intro:
      "Telecaller hiring managers skim for three things: how clearly you speak, which languages you handle, and whether you can hit a daily call target. This example puts all three on top.",
    tips: [
      "Lead with your call volume and target numbers — “80+ calls a day” beats “handled calls”.",
      "List every language you can speak on a call; regional languages often decide the shortlist.",
      "Freshers: mention college presentations, part-time sales or any customer-facing work.",
      "Keep it to one page — recruiters spend under a minute on a telecaller resume.",
    ],
    resume: emptyResume({
      name: "Priya Sharma",
      headline: "Telecaller — Inbound & Outbound Sales",
      phone: "+91 98765 43210",
      email: "priya.sharma@example.com",
      location: "KR Puram, Bengaluru",
      summary:
        "Telecaller with 1.5 years in outbound sales and lead follow-up. Comfortable with high call volumes, explaining products simply and converting interest into sales. Fluent in Kannada, Hindi and English.",
      skills: ["Inbound & outbound calls", "Objection handling", "Sales & lead conversion", "CRM tools", "Clear communication", "MS Excel"],
      languages: [
        { name: "Kannada", level: "Native" },
        { name: "Hindi", level: "Fluent" },
        { name: "English", level: "Fluent" },
      ],
      experience: [
        {
          role: "Telecaller",
          company: "Sunrise Finserv",
          location: "Bengaluru",
          start: "Mar 2024",
          end: "",
          current: true,
          points:
            "Make 90–110 outbound calls a day to warm and cold leads\nConvert around 8% of leads into appointments, above the team average\nUpdate call notes and follow-up dates in the CRM after every call\nMet the monthly sales target in 10 of the last 12 months",
        },
      ],
      education: [{ degree: "B.Com", school: "Bangalore University", year: "2023", score: "68%" }],
      certifications: "Typing certificate — 35 WPM",
    }),
  },
  {
    slug: "customer-support",
    role: "Customer Support Executive",
    searchTitle: "Customer Support Executive Resume Example",
    intro:
      "Support roles reward patience and process. Show the channels you've handled (voice, chat, email), the quality scores you kept, and how you calm down an upset customer.",
    tips: [
      "Name your channels: voice, chat, email — many BPOs hire separately for each.",
      "Quote your quality or CSAT score if it was good; it is the number support managers trust.",
      "Mention tools you've used (CRM, ticketing) even if briefly.",
      "Show you can work rotational or night shifts if you can — it widens your options.",
    ],
    resume: emptyResume({
      name: "Rahul Menon",
      headline: "Customer Support Executive — Voice & Chat",
      phone: "+91 91234 56789",
      email: "rahul.menon@example.com",
      location: "Marathahalli, Bengaluru",
      summary:
        "Customer support executive with 2 years of voice and chat experience for an e-commerce process. Patient, solution-focused and consistent on quality scores. Comfortable with rotational shifts.",
      skills: ["Complaint resolution", "Email & chat support", "Active listening", "CRM tools", "Call quality auditing", "Night shifts / rotational shifts"],
      languages: [
        { name: "Malayalam", level: "Native" },
        { name: "English", level: "Fluent" },
        { name: "Tamil", level: "Conversational" },
      ],
      experience: [
        {
          role: "Customer Support Executive",
          company: "ShopKart Services",
          location: "Bengaluru",
          start: "Jun 2023",
          end: "",
          current: true,
          points:
            "Resolve 60+ order, refund and delivery queries a day over voice and chat\nMaintain a 92% average quality audit score\nCut repeat calls by fixing issues fully on the first contact\nTrained four new joiners on the refund process",
        },
      ],
      education: [{ degree: "BBA", school: "Christ University", year: "2023", score: "" }],
    }),
  },
  {
    slug: "bpo-fresher",
    role: "BPO Fresher",
    searchTitle: "BPO Fresher Resume Format (No Experience)",
    intro:
      "No experience? No problem. BPOs hire thousands of freshers every year. Your resume just needs to prove you communicate well, learn fast and will show up for your shift.",
    tips: [
      "Put a short, honest summary on top — say you're a fresher and ready to join immediately.",
      "Use college projects, events, NCC, sports or part-time work as experience.",
      "List every language you speak, with an honest level.",
      "Add a typing speed or computer course — easy proof of basic skills.",
    ],
    resume: emptyResume({
      name: "Ananya Reddy",
      headline: "Graduate Fresher — Customer Service",
      phone: "+91 99887 76655",
      email: "ananya.reddy@example.com",
      location: "Ramamurthy Nagar, Bengaluru",
      summary:
        "Motivated B.Sc graduate with strong communication skills in English, Telugu and Kannada. Quick learner, comfortable on the phone and keen to start a career in customer service. Available for rotational shifts and ready to join immediately.",
      skills: ["Clear communication", "Active listening", "MS Excel", "Typing 35+ WPM", "Data entry", "Customer handling"],
      languages: [
        { name: "Telugu", level: "Native" },
        { name: "English", level: "Fluent" },
        { name: "Kannada", level: "Fluent" },
        { name: "Hindi", level: "Conversational" },
      ],
      experience: [
        {
          role: "Event Volunteer — College Fest",
          company: "Government Science College",
          location: "Bengaluru",
          start: "2024",
          end: "2024",
          current: false,
          points: "Handled registrations and queries for 500+ visitors over two days\nCoordinated with a team of 12 volunteers",
        },
      ],
      education: [
        { degree: "B.Sc (Computer Science)", school: "Government Science College", year: "2025", score: "71%" },
        { degree: "12th / PUC", school: "Sri Chaitanya PU College", year: "2022", score: "78%" },
      ],
      certifications: "Typing certificate — 38 WPM\nBasic computer course (MS Office)",
    }),
  },
  {
    slug: "team-leader",
    role: "Team Leader (BPO)",
    searchTitle: "BPO Team Leader Resume Example",
    intro:
      "A team leader resume is judged on the team's numbers, not yours. Show team size, the targets you owned, and what you did to lift quality and attendance.",
    tips: [
      "State your team size and the metrics you owned — sales, collections, AHT, quality or attrition.",
      "Show improvement with before/after numbers wherever you can.",
      "Mention coaching, floor management and reporting to clients.",
      "Keep earlier agent roles short — one or two lines each.",
    ],
    resume: emptyResume({
      name: "Mohammed Irfan",
      headline: "Team Leader — Collections Process",
      phone: "+91 90000 12345",
      email: "irfan.m@example.com",
      location: "Ramamurthy Nagar, Bengaluru",
      summary:
        "Team leader with 5 years in BPO collections, including 2 years leading a team of 15 telecallers. Known for steady recovery numbers, daily coaching and keeping attrition low through peak months.",
      skills: ["Team leadership", "Collections & follow-ups", "Call quality auditing", "MS Excel", "Objection handling", "CRM tools"],
      languages: [
        { name: "Urdu", level: "Native" },
        { name: "Hindi", level: "Fluent" },
        { name: "Kannada", level: "Fluent" },
        { name: "English", level: "Fluent" },
      ],
      experience: [
        {
          role: "Team Leader",
          company: "Apex Recovery Solutions",
          location: "Bengaluru",
          start: "Apr 2023",
          end: "",
          current: true,
          points:
            "Lead a team of 15 telecallers on a two-wheeler loan collections process\nRaised the team's monthly recovery rate from 61% to 72% in six months\nRun daily huddles, call audits and one-on-one coaching\nKept first-month attrition of new joiners under 10%",
        },
        {
          role: "Senior Telecaller",
          company: "Apex Recovery Solutions",
          location: "Bengaluru",
          start: "Jan 2020",
          end: "Mar 2023",
          current: false,
          points: "Top recovery performer for 8 months in a row\nMentored new joiners on soft-skills and compliance",
        },
      ],
      education: [{ degree: "B.A.", school: "Bangalore University", year: "2019", score: "" }],
    }),
  },
  {
    slug: "collections-executive",
    role: "Collections Executive",
    searchTitle: "Collections Executive Resume Example",
    intro:
      "Collections teams want people who stay calm, polite and persistent. Show your recovery numbers and that you understand compliant, respectful follow-up.",
    tips: [
      "Lead with your recovery rate or amount collected per month.",
      "Mention the product: gold loans, personal loans, credit cards, two-wheeler loans.",
      "Show you follow compliance rules — lenders care a lot about this.",
      "Regional languages are a big plus for collections calls.",
    ],
    resume: emptyResume({
      name: "Kavya Gowda",
      headline: "Collections Executive — Gold & Personal Loans",
      phone: "+91 97411 22334",
      email: "kavya.gowda@example.com",
      location: "Banaswadi, Bengaluru",
      summary:
        "Collections executive with 2 years on gold and personal loan portfolios. Calm, respectful and persistent on calls, with a steady record of meeting monthly recovery targets while following compliance guidelines.",
      skills: ["Collections & follow-ups", "Objection handling", "Clear communication", "CRM tools", "Complaint resolution", "MS Excel"],
      languages: [
        { name: "Kannada", level: "Native" },
        { name: "English", level: "Fluent" },
        { name: "Hindi", level: "Conversational" },
      ],
      experience: [
        {
          role: "Collections Executive",
          company: "Trust Gold Finance (via BPO partner)",
          location: "Bengaluru",
          start: "Aug 2023",
          end: "",
          current: true,
          points:
            "Follow up on 70+ overdue accounts a day by phone and WhatsApp\nRecover an average of ₹6–8 lakh a month against target\nNegotiate payment plans while following RBI fair-practice guidelines\nRecognised as Employee of the Month, February 2025",
        },
      ],
      education: [{ degree: "B.Com", school: "St. Joseph's College", year: "2023", score: "" }],
      certifications: "Employee of the Month — Feb 2025",
    }),
  },
];

export const exampleBySlug = (slug: string) => RESUME_EXAMPLES.find((e) => e.slug === slug) ?? null;
