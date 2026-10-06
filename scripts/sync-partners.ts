/**
 * One-off: make the website's partner list match the current hiring partners.
 * Partners not in the list are hidden from the site (not deleted — they may have history).
 *
 *   npx tsx scripts/sync-partners.ts
 */
import "./env";
import mongoose from "mongoose";
import { Partner } from "../src/lib/models";

const CURRENT = ["Nex-Gen", "Expert Callers", "Sowtech", "Washohub.in", "Zlaark", "JoAji Innovation"];
const RENAMES: Record<string, string> = { Washohub: "Washohub.in" };

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const [from, to] of Object.entries(RENAMES)) {
    if (!(await Partner.exists({ name: to }))) await Partner.updateOne({ name: from }, { $set: { name: to } });
  }
  for (const name of CURRENT) {
    await Partner.updateOne(
      { name },
      { $set: { showOnSite: true, isActive: true }, $setOnInsert: { name, location: name === "Nex-Gen" ? "HBR Layout, Bangalore" : "Bangalore" } },
      { upsert: true },
    );
  }
  const hidden = await Partner.updateMany({ name: { $nin: CURRENT } }, { $set: { showOnSite: false } });
  const list = await Partner.find({ showOnSite: true }).sort({ createdAt: 1 }).select("name").lean();
  console.log("On website:", list.map((p) => p.name).join(", "), `| hidden: ${hidden.modifiedCount}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
