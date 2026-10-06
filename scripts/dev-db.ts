/**
 * Local MongoDB for development without installing Mongo or Docker.
 * Data persists in ./.devdb between runs.
 *
 *   npm run db:dev        → mongodb://127.0.0.1:27027/kelasahub
 */
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

async function main() {
  mkdirSync(".devdb", { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { port: 27027, dbPath: ".devdb", storageEngine: "wiredTiger" },
  });
  console.log(`Dev MongoDB running at ${server.getUri()}kelasahub`);
  const stop = async () => {
    await server.stop({ doCleanup: false });
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main();
