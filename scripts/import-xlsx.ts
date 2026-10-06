/**
 * Imports the existing Google-Sheet export into MongoDB.
 *
 *   npm run import:xlsx -- "../KelasaHub - Applications.xlsx"
 */
import "./env";
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { parseApplicationsWorkbook } from "../src/lib/sheet";
import { importRows } from "../src/lib/importer";

async function main() {
  const file = process.argv[2] || "../KelasaHub - Applications.xlsx";
  const rows = await parseApplicationsWorkbook(readFileSync(file));
  console.log(`Parsed ${rows.length} rows from ${file}`);
  await mongoose.connect(process.env.MONGODB_URI!);
  const res = await importRows(rows, "Spreadsheet import");
  console.log(res);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
