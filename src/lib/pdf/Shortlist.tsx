import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SITE } from "../constants";
import { C, fmt, LOGO_PATH } from "./shared";

export type ShortlistRow = {
  candidateId: string;
  name: string;
  phone: string;
  role: string;
  area: string;
  experience: string;
  languages: string;
  shift: string;
  salary: string;
  status: string;
  notes: string;
};

const COLS: { key: keyof ShortlistRow | "#"; label: string; w: number }[] = [
  { key: "#", label: "#", w: 3 },
  { key: "candidateId", label: "Candidate ID", w: 9 },
  { key: "name", label: "Name", w: 13 },
  { key: "phone", label: "Phone", w: 9 },
  { key: "role", label: "Role", w: 14 },
  { key: "area", label: "Area", w: 8 },
  { key: "experience", label: "Experience", w: 9 },
  { key: "languages", label: "Languages", w: 11 },
  { key: "shift", label: "Shift", w: 7 },
  { key: "salary", label: "Exp. salary", w: 7 },
  { key: "status", label: "Status", w: 10 },
];

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 8, color: C.text, paddingTop: 28, paddingBottom: 44, paddingHorizontal: 28 },
  head: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  title: { fontFamily: "Bricolage", fontSize: 18, color: C.ink },
  meta: { fontSize: 8.5, color: C.muted, marginTop: 3 },
  count: { marginLeft: "auto", backgroundColor: C.ink, color: "#fff", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignItems: "center" },
  th: { flexDirection: "row", backgroundColor: C.ink, color: "#fff", fontWeight: 600, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line },
  cell: { paddingVertical: 5.5, paddingHorizontal: 4 },
  footer: { position: "absolute", bottom: 18, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.muted },
});

export function ShortlistDoc({ rows, title, subtitle }: { rows: ShortlistRow[]; title: string; subtitle: string }) {
  return (
    <Document title={title} author="KelasaHub">
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO_PATH} style={{ width: 28, height: 32, marginRight: 10 }} />
          <View>
            <Text style={s.title}>{title}</Text>
            <Text style={s.meta}>{subtitle}</Text>
          </View>
          <View style={s.count}>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>{rows.length}</Text>
            <Text style={{ fontSize: 6.5, letterSpacing: 0.8 }}>CANDIDATES</Text>
          </View>
        </View>

        <View style={s.th} fixed>
          {COLS.map((c) => (
            <Text key={c.key} style={[s.cell, { width: `${c.w}%` }]}>
              {c.label}
            </Text>
          ))}
        </View>
        {rows.map((r, i) => (
          <View key={r.candidateId + i} style={[s.tr, { backgroundColor: i % 2 ? "#fafbfc" : "#fff" }]} wrap={false}>
            {COLS.map((c) => (
              <Text
                key={c.key}
                style={[
                  s.cell,
                  { width: `${c.w}%` },
                  c.key === "name" ? { fontWeight: 600, color: C.ink } : {},
                  c.key === "candidateId" ? { color: C.muted } : {},
                ]}
              >
                {c.key === "#" ? i + 1 : r[c.key] || "—"}
              </Text>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>
            KelasaHub · {SITE.email} · {SITE.phoneDisplay} · Generated {fmt(new Date())}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
