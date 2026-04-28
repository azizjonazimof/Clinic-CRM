import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const databaseDir = resolve(".local-db/postgres");
mkdirSync(databaseDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "medical_crm",
  password: "medical_crm",
  port: 5432,
  persistent: true,
  onLog: (message) => process.stdout.write(String(message)),
  onError: (message) => process.stderr.write(String(message))
});

let stopped = false;

async function stop() {
  if (stopped) return;
  stopped = true;
  await pg.stop().catch(() => undefined);
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await pg.initialise();
await pg.start();
await pg.createDatabase("medical_crm").catch((error) => {
  if (!String(error?.message ?? error).includes("already exists")) {
    throw error;
  }
});

console.log("\nEmbedded Postgres is running on localhost:5432");

await new Promise(() => undefined);
