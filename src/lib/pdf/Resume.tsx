import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ACCENTS, pointsOf, type ResumeData } from "../resume";
import { C } from "./shared";

// Single-column and text-only on purpose: applicant tracking systems read it cleanly.
const st = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 10, color: C.text, paddingTop: 40, paddingBottom: 48, paddingHorizontal: 46, lineHeight: 1.45 },
  name: { fontFamily: "Bricolage", fontSize: 26, lineHeight: 1.1 },
  headline: { fontSize: 11.5, fontWeight: 600, marginTop: 4 },
  contact: { marginTop: 8, color: C.muted, fontSize: 9.5 },
  rule: { height: 2, marginTop: 14 },
  section: { marginTop: 16 },
  // No letter-spacing: spaced capitals extract as "P R O F I L E" in ATS text parsers.
  h: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  role: { fontWeight: 700, fontSize: 10.5 },
  org: { color: C.muted },
  date: { color: C.muted, fontSize: 9.5 },
  bullet: { flexDirection: "row", marginTop: 2, paddingRight: 8 },
  bulletDot: { width: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: { fontSize: 9.5, borderWidth: 1, borderColor: C.line, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginRight: 5, marginBottom: 5 },
  foot: { position: "absolute", bottom: 22, left: 46, right: 46, fontSize: 7.5, color: "#9aa5b4", textAlign: "center" },
});

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={st.section}>
      <Text style={[st.h, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

export function ResumeDoc({ r }: { r: ResumeData }) {
  const accent = ACCENTS[r.accent] ?? ACCENTS.teal;
  const contact = [r.phone, r.email, r.location].filter(Boolean);
  const experience = r.experience.filter((e) => e.role || e.company);
  const education = r.education.filter((e) => e.degree || e.school);
  const certs = r.certifications.split("\n").map((l) => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);

  return (
    <Document title={`${r.name || "Resume"} — Resume`} author={r.name} creator="KelasaHub resume builder">
      <Page size="A4" style={st.page}>
        <Text style={[st.name, { color: C.ink }]}>{r.name || "Your Name"}</Text>
        {r.headline && <Text style={[st.headline, { color: accent }]}>{r.headline}</Text>}
        {contact.length > 0 && <Text style={st.contact}>{contact.join("   ·   ")}</Text>}
        <View style={[st.rule, { backgroundColor: accent }]} />

        {r.summary && (
          <Section title="Profile" color={accent}>
            <Text>{r.summary}</Text>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Experience" color={accent}>
            {experience.map((e, i) => (
              <View key={i} wrap={false} style={{ marginTop: i ? 10 : 0 }}>
                <View style={st.row}>
                  <Text style={st.role}>{e.role}</Text>
                  <Text style={st.date}>{[e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ")}</Text>
                </View>
                <Text style={st.org}>{[e.company, e.location].filter(Boolean).join(", ")}</Text>
                {pointsOf(e).map((p) => (
                  <View key={p} style={st.bullet}>
                    <Text style={[st.bulletDot, { color: accent }]}>•</Text>
                    <Text style={{ flex: 1 }}>{p}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education" color={accent}>
            {education.map((e, i) => (
              <View key={i} wrap={false} style={[st.row, { marginTop: i ? 6 : 0 }]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={st.role}>{e.degree}</Text>
                  <Text style={st.org}>{[e.school, e.score].filter(Boolean).join(" · ")}</Text>
                </View>
                <Text style={st.date}>{e.year}</Text>
              </View>
            ))}
          </Section>
        )}

        {r.skills.length > 0 && (
          <Section title="Skills" color={accent}>
            <View style={st.chips}>
              {r.skills.map((s) => (
                <Text key={s} style={st.chip}>{s}</Text>
              ))}
            </View>
          </Section>
        )}

        {r.languages.length > 0 && (
          <Section title="Languages" color={accent}>
            <Text>{r.languages.map((l) => `${l.name} (${l.level})`).join("   ·   ")}</Text>
          </Section>
        )}

        {certs.length > 0 && (
          <Section title="Certifications & achievements" color={accent}>
            {certs.map((c) => (
              <View key={c} style={st.bullet}>
                <Text style={[st.bulletDot, { color: accent }]}>•</Text>
                <Text style={{ flex: 1 }}>{c}</Text>
              </View>
            ))}
          </Section>
        )}

        <Text style={st.foot} fixed>Made with the free resume builder at kelasahub.in</Text>
      </Page>
    </Document>
  );
}
