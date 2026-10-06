import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { OFFICE, SITE } from "../constants";
import { C, base, fmt, LOGO_PATH, WATERMARK_PATH } from "./shared";

export type ApplicationData = {
  candidateId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  nationality: string;
  address: string;
  pincode: string;
  area: string;
  languages: string[];
  intlLanguages: string[];
  employmentStatus: string;
  expYears: string;
  lastCompany: string;
  shiftPreference: string;
  targetSalary: string;
  education: { tenth?: string; twelfth?: string; graduate?: string; postGraduate?: string };
  referredBy: string;
  dateApplied: Date | string;
  partner: { name: string; location: string; address?: string } | null;
};

const s = StyleSheet.create({
  header: { backgroundColor: C.ink, paddingVertical: 22, paddingHorizontal: 36, flexDirection: "row", alignItems: "center" },
  logoBox: { width: 46, height: 46, backgroundColor: "#fff", borderRadius: 9, alignItems: "center", justifyContent: "center", marginRight: 14 },
  title: { fontFamily: "Bricolage", fontSize: 17, color: "#fff", letterSpacing: 0.2 },
  subtitle: { fontSize: 9, color: "#c6cfdb", marginTop: 4 },
  idBox: { marginLeft: "auto", borderWidth: 1, borderColor: "#3b5679", borderRadius: 7, paddingVertical: 6, paddingHorizontal: 10, alignItems: "flex-end" },
  idLabel: { fontSize: 6.5, color: "#a9b6c7", letterSpacing: 1, textTransform: "uppercase" },
  idValue: { fontSize: 11, fontWeight: 700, color: C.sun, marginTop: 2 },
  body: { paddingHorizontal: 36, paddingTop: 18 },
  section: { marginTop: 12 },
  sectionTitle: {
    backgroundColor: C.paper,
    color: C.amber,
    fontWeight: 700,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
  },
  row: { flexDirection: "row", marginTop: 9 },
  field: { flexDirection: "row", alignItems: "flex-end", flexGrow: 1, flexBasis: 0, borderBottomWidth: 0.6, borderBottomColor: C.line, paddingBottom: 3, marginHorizontal: 0 },
  label: { fontWeight: 700, color: C.ink, marginRight: 5 },
  value: { color: "#44536a", flexShrink: 1 },
  role: { fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 9, paddingHorizontal: 2 },
  check: { width: 10, height: 10, borderWidth: 0.9, borderColor: C.ink, marginRight: 5, alignItems: "center", justifyContent: "center" },
  footer: { position: "absolute", left: 36, right: 36, bottom: 22, borderTopWidth: 0.6, borderTopColor: C.line, paddingTop: 8, fontSize: 7.5, color: C.muted },
  signRow: { flexDirection: "row", marginTop: 28, justifyContent: "space-between" },
  sign: { width: 170, borderTopWidth: 0.8, borderTopColor: C.muted, paddingTop: 4, fontSize: 8, color: C.muted, textAlign: "center" },
});

function F({ label, value, grow = 1 }: { label: string; value?: string | null; grow?: number }) {
  return (
    <View style={[s.field, { flexGrow: grow }]}>
      <Text style={s.label}>{label}:</Text>
      <Text style={s.value}>{value || " "}</Text>
    </View>
  );
}
const Gap = () => <View style={{ width: 22 }} />;

function Box({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 26 }}>
      <View style={s.check}>{checked ? <Text style={{ fontSize: 7.5, fontWeight: 700, marginTop: -1 }}>X</Text> : null}</View>
      <Text>{label}</Text>
    </View>
  );
}

function Watermark() {
  const rows = 7;
  const cols = 6;
  return (
    <View fixed style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: "row", justifyContent: "space-around", marginTop: r === 0 ? 150 : 72 }}>
          {Array.from({ length: cols }).map((_, c) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image key={c} src={WATERMARK_PATH} style={{ width: 34, height: 38, opacity: 0.045 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function ApplicationPage({ c }: { c: ApplicationData }) {
  const company = c.partner?.name ?? "KelasaHub";
  const location = c.partner?.location || "Bangalore";
  const langs = [...c.languages, ...c.intlLanguages].join(", ");
  return (
    <Page size="A4" style={base.page}>
      <Watermark />
      <View style={s.header} fixed>
        <View style={s.logoBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO_PATH} style={{ width: 30, height: 34 }} />
        </View>
        <View>
          <Text style={s.title}>JOB APPLICATION FORM – {company.toUpperCase()}</Text>
          <Text style={s.subtitle}>
            {location} | In partnership with KelasaHub
          </Text>
        </View>
        <View style={s.idBox}>
          <Text style={s.idLabel}>Candidate ID</Text>
          <Text style={s.idValue}>{c.candidateId}</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Position applied for</Text>
          <Text style={s.role}>{c.role || "—"}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal information</Text>
          <View style={s.row}>
            <F label="Full Name" value={c.name} />
          </View>
          <View style={s.row}>
            <F label="Phone Number" value={c.phone} />
            <Gap />
            <F label="Email Address" value={c.email} grow={1.3} />
          </View>
          <View style={s.row}>
            <F label="Nationality" value={c.nationality} />
            <Gap />
            <F label="Preferred Area" value={c.area} />
          </View>
          <View style={s.row}>
            <F label="Address" value={c.address} />
          </View>
          <View style={s.row}>
            <F label="Pincode" value={c.pincode} />
            <Gap />
            <F label="Languages Known" value={langs} grow={1.6} />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Employment status</Text>
          <View style={[s.row, { alignItems: "center" }]}>
            <Text style={{ marginRight: 10 }}>Status:</Text>
            <Box checked={c.employmentStatus === "Fresher"} label="Fresher" />
            <Box checked={c.employmentStatus === "Experienced"} label="Experienced" />
          </View>
          {c.employmentStatus === "Experienced" && (
            <View style={s.row}>
              <F label="Years of Experience" value={c.expYears} />
              <Gap />
              <F label="Last Company" value={c.lastCompany} grow={1.4} />
            </View>
          )}
          <View style={s.row}>
            <F label="Shift Preference" value={c.shiftPreference} />
            <Gap />
            <F label="Expected Salary" value={c.targetSalary ? `₹${c.targetSalary.replace(/^₹/, "")}/month` : ""} />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Education details</Text>
          <View style={s.row}>
            <F label="10th Standard" value={c.education?.tenth} />
          </View>
          <View style={s.row}>
            <F label="12th / 2nd PUC" value={c.education?.twelfth} />
          </View>
          <View style={s.row}>
            <F label="Graduate" value={c.education?.graduate} />
          </View>
          <View style={s.row}>
            <F label="Post-Graduate" value={c.education?.postGraduate} />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Referral</Text>
          <View style={s.row}>
            <F label="Referred By" value={c.referredBy || "KelasaHub"} />
            <Gap />
            <F label="Date Applied" value={fmt(c.dateApplied)} />
          </View>
        </View>

        <View style={s.signRow}>
          <Text style={s.sign}>Candidate signature</Text>
          <Text style={s.sign}>For {company}</Text>
        </View>
      </View>

      <View style={s.footer} fixed>
        <Text>
          Submit to: {SITE.email}  |  Call/WhatsApp: {SITE.phoneDisplay}  |  {company}, {location}
        </Text>
        <Text style={{ marginTop: 3 }}>
          Generated on {fmt(new Date())} via KelasaHub · {OFFICE.address}
        </Text>
      </View>
    </Page>
  );
}

export function ApplicationForms({ candidates }: { candidates: ApplicationData[] }) {
  return (
    <Document title={candidates.length === 1 ? `Application – ${candidates[0].name}` : "Application forms"} author="KelasaHub">
      {candidates.map((c) => (
        <ApplicationPage key={c.candidateId} c={c} />
      ))}
    </Document>
  );
}
