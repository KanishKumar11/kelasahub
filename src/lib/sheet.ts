import ExcelJS from "exceljs";
import {
  ATTRITION,
  INTERVIEW_STATUS,
  OVERALL_STATUS,
  QUALITY,
  SCREENING_STATUS,
  SHIFT_PREFERENCE,
  TRAINING,
} from "./constants";
import { timeToFill } from "./models";

/** Column order of "KelasaHub - Applications.xlsx", followed by the extra fields the new system captures. */
export const SHEET_COLUMNS = [
  "Candidate ID",
  "Candidate Name",
  "Phone",
  "Email",
  "Source",
  "BPO Partner",
  "Role Applied",
  "Area (Bangalore)",
  "Date Applied",
  "Screening Status",
  "Interview Status",
  "Overall Status",
  "Quality Score (1-10)",
  "Shift Preference",
  "Target Salary (₹/mo)",
  "Date Selected",
  "Joining Date",
  "Time to Fill (days)",
  "First-Month Attrition",
  "Training Graduation",
  "Last Contacted",
  "Notes",
  "Selection Email Sent",
  // extras
  "Interview Date",
  "Employment Status",
  "Experience",
  "Last Company",
  "Languages",
  "Address",
  "Pincode",
  "10th",
  "12th / PUC",
  "Graduate",
  "Post-Graduate",
] as const;

const DROPDOWNS: Partial<Record<(typeof SHEET_COLUMNS)[number], readonly string[]>> = {
  "Screening Status": SCREENING_STATUS,
  "Interview Status": INTERVIEW_STATUS,
  "Overall Status": OVERALL_STATUS,
  "Quality Score (1-10)": QUALITY,
  "Shift Preference": SHIFT_PREFERENCE,
  "First-Month Attrition": ATTRITION,
  "Training Graduation": TRAINING,
};

// Loose shape so both lean docs and populated docs fit.
type Row = Record<string, unknown> & {
  candidateId: string;
  name: string;
  phone: string;
  partner?: { name?: string } | null;
  education?: { tenth?: string; twelfth?: string; graduate?: string; postGraduate?: string } | null;
  languages?: string[];
  intlLanguages?: string[];
  dateApplied?: Date | null;
  dateSelected?: Date | null;
};

export async function candidatesToWorkbook(rows: Row[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "KelasaHub";
  const ws = wb.addWorksheet("Applications", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });
  ws.columns = SHEET_COLUMNS.map((h) => ({
    header: h,
    key: h,
    width: ["Notes", "Address", "Email", "Role Applied"].includes(h) ? 34 : h.length < 12 ? 14 : h.length + 4,
    style: h.includes("Date") || h === "Last Contacted" ? { numFmt: "dd mmm yyyy" } : {},
  }));
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B1F3A" } };
  header.height = 22;

  for (const c of rows) {
    const ed = c.education ?? {};
    ws.addRow({
      "Candidate ID": c.candidateId,
      "Candidate Name": c.name,
      Phone: c.phone,
      Email: c.email,
      Source: c.source,
      "BPO Partner": c.partner?.name ?? "",
      "Role Applied": c.role,
      "Area (Bangalore)": c.area,
      "Date Applied": c.dateApplied ?? null,
      "Screening Status": c.screeningStatus,
      "Interview Status": c.interviewStatus,
      "Overall Status": c.overallStatus,
      "Quality Score (1-10)": c.quality,
      "Shift Preference": c.shiftPreference,
      "Target Salary (₹/mo)": c.targetSalary,
      "Date Selected": c.dateSelected ?? null,
      "Joining Date": c.joiningDate ?? null,
      "Time to Fill (days)": timeToFill(c),
      "First-Month Attrition": c.firstMonthAttrition,
      "Training Graduation": c.trainingGraduation,
      "Last Contacted": c.lastContacted ?? null,
      Notes: c.notes,
      "Selection Email Sent": c.selectionEmailSent ? "Yes" : "",
      "Interview Date": c.interviewDate ?? null,
      "Employment Status": c.employmentStatus,
      Experience: [c.experienceLevel, c.expYears ? `${c.expYears} yrs` : ""].filter(Boolean).join(" "),
      "Last Company": c.lastCompany,
      Languages: [...(c.languages ?? []), ...(c.intlLanguages ?? [])].join(", "),
      Address: c.address,
      Pincode: c.pincode,
      "10th": ed.tenth,
      "12th / PUC": ed.twelfth,
      Graduate: ed.graduate,
      "Post-Graduate": ed.postGraduate,
    });
  }

  // Same dropdowns as the original sheet so offline edits stay clean.
  const last = Math.max(rows.length + 1, 500);
  SHEET_COLUMNS.forEach((h, i) => {
    const list = DROPDOWNS[h];
    if (!list) return;
    const col = ws.getColumn(i + 1).letter;
    for (let r = 2; r <= last; r++) {
      ws.getCell(`${col}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${list.join(",")}"`],
      };
    }
  });
  ws.autoFilter = { from: "A1", to: `${ws.getColumn(SHEET_COLUMNS.length).letter}1` };
  return wb;
}

/* --------------------------------- Import ---------------------------------- */

const LEGACY_SOURCES: Record<string, string> = {
  "Job Application": "Job Application Form",
  "Signup Form": "Talent Pool",
};

function cellValue(v: ExcelJS.CellValue): unknown {
  if (v && typeof v === "object") {
    if (v instanceof Date) return v;
    if ("result" in v) return v.result;
    if ("text" in v) return v.text;
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
  }
  return v;
}

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());
const date = (v: unknown) => {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(Math.round((v - 25569) * 86_400_000)); // Excel serial
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};
const oneOf = (v: unknown, list: readonly string[]) => {
  const s = str(v);
  return list.find((x) => x.toLowerCase() === s.toLowerCase()) ?? "";
};

export type ImportedRow = {
  kind: "candidate" | "lead";
  data: Record<string, unknown>;
  partnerName: string;
};

/** Reads the Applications sheet (old or new export) into plain candidate objects. */
export async function parseApplicationsWorkbook(buffer: ArrayBuffer | Buffer): Promise<ImportedRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as ArrayBuffer);
  const ws = wb.getWorksheet("Applications") ?? wb.worksheets[0];
  if (!ws) return [];

  const headers: Record<number, string> = {};
  ws.getRow(1).eachCell((cell, col) => (headers[col] = str(cellValue(cell.value))));

  const out: ImportedRow[] = [];
  ws.eachRow((row, r) => {
    if (r === 1) return;
    const g: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      if (headers[col]) g[headers[col]] = cellValue(cell.value);
    });
    const name = str(g["Candidate Name"]);
    if (!name && !str(g["Candidate ID"])) return;

    const rawSource = str(g["Source"]);
    if (rawSource === "Business Manpower Quotation Request") {
      out.push({
        kind: "lead",
        partnerName: "",
        data: { name: name || "Unknown", company: str(g["Notes"]) || "—", status: "New", notes: "Imported from sheet" },
      });
      return;
    }

    let phone = str(g["Phone"]).replace(/\.0$/, "").replace(/\D/g, "");
    if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
    const notes = str(g["Notes"]);
    const dateSelected = date(g["Date Selected"]);

    out.push({
      kind: "candidate",
      partnerName: str(g["BPO Partner"]),
      data: {
        candidateId: str(g["Candidate ID"]),
        name,
        phone,
        email: str(g["Email"]).toLowerCase(),
        source: LEGACY_SOURCES[rawSource] ?? (rawSource || "Manual Entry"),
        role: str(g["Role Applied"]),
        area: str(g["Area (Bangalore)"]),
        dateApplied: date(g["Date Applied"]) ?? new Date(),
        screeningStatus: oneOf(g["Screening Status"], SCREENING_STATUS) || "New",
        interviewStatus: oneOf(g["Interview Status"], INTERVIEW_STATUS) || "Not Scheduled",
        overallStatus: oneOf(g["Overall Status"], OVERALL_STATUS),
        quality: oneOf(g["Quality Score (1-10)"], QUALITY),
        shiftPreference: oneOf(g["Shift Preference"], SHIFT_PREFERENCE),
        targetSalary: str(g["Target Salary (₹/mo)"]).replace(/\.0$/, ""),
        dateSelected,
        joiningDate: date(g["Joining Date"]),
        firstMonthAttrition: oneOf(g["First-Month Attrition"], ATTRITION),
        trainingGraduation: oneOf(g["Training Graduation"], TRAINING),
        lastContacted: date(g["Last Contacted"]),
        notes,
        selectionEmailSent: /^(yes|true|y)$/i.test(str(g["Selection Email Sent"])),
        interviewDate: date(g["Interview Date"]),
        employmentStatus: oneOf(g["Employment Status"], ["Fresher", "Experienced"]),
        lastCompany: str(g["Last Company"]),
        languages: str(g["Languages"]).split(/,\s*/).filter(Boolean),
        address: str(g["Address"]),
        pincode: str(g["Pincode"]).replace(/\.0$/, ""),
        education: {
          tenth: str(g["10th"]),
          twelfth: str(g["12th / PUC"]),
          graduate: str(g["Graduate"]),
          postGraduate: str(g["Post-Graduate"]),
        },
      },
    });
  });
  return out;
}
