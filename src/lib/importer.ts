import { Candidate, Lead, Partner, nextCandidateId } from "./models";
import type { ImportedRow } from "./sheet";

/**
 * Upserts parsed sheet rows. A row updates the existing candidate with the same ID and phone;
 * an ID clash with a different phone gets a suffixed ID (the old sheet reused some IDs).
 */
export async function importRows(rows: ImportedRow[], by = "Import") {
  const partnerIds = new Map<string, unknown>();
  const result = { created: 0, updated: 0, leads: 0, skipped: 0 };

  for (const row of rows) {
    if (row.kind === "lead") {
      await Lead.create(row.data);
      result.leads++;
      continue;
    }
    const d = row.data as Record<string, unknown> & { candidateId: string; phone: string; name: string };
    if (!d.name || !d.phone) {
      result.skipped++;
      continue;
    }

    if (row.partnerName) {
      if (!partnerIds.has(row.partnerName)) {
        const p = await Partner.findOneAndUpdate(
          { name: row.partnerName },
          { $setOnInsert: { name: row.partnerName } },
          { upsert: true, new: true },
        );
        partnerIds.set(row.partnerName, p!._id);
      }
      d.partner = partnerIds.get(row.partnerName);
    }

    if (d.candidateId) {
      const existing = await Candidate.findOne({ candidateId: d.candidateId });
      if (existing && existing.phone === d.phone) {
        const { candidateId: _id, ...rest } = d;
        void _id;
        existing.set(rest);
        await existing.save();
        result.updated++;
        continue;
      }
      if (existing) {
        let n = 2;
        while (await Candidate.exists({ candidateId: `${d.candidateId}-${n}` })) n++;
        d.candidateId = `${d.candidateId}-${n}`;
      }
    } else {
      d.candidateId = await nextCandidateId(d.dateApplied as Date);
    }

    await Candidate.create({
      ...d,
      activity: [{ by, type: "system", text: "Imported from spreadsheet" }],
    });
    result.created++;
  }
  return result;
}
