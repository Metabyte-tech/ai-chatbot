import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { existsSync } from "node:fs";

// Load .env.local (local dev) or .env (Amplify/CI) if they exist.
// Managed environments like AWS Amplify provide variables directly in process.env.
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else if (existsSync(".env")) {
  config({ path: ".env" });
}

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.warn("⏭️  POSTGRES_URL not defined, skipping migrations.");
    console.warn("   If this is Amplify, ensure POSTGRES_URL is set in the Console.");
    process.exit(0);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("📡 Attempting to connect to database...");

  try {
    // Test the connection before proceeding
    await connection`SELECT 1`;
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Failed to connect to the database:");
    console.error(error);
    await connection.end();
    process.exit(1);
  }

  console.log("⏳ Running migrations...");

  const start = Date.now();
  try {
    await migrate(db, { migrationsFolder: "./lib/db/migrations" });
    const end = Date.now();
    console.log("✅ Migrations completed successfully in", end - start, "ms");
  } catch (error) {
    console.error("❌ Migration process failed:");
    console.error(error);
    await connection.end();
    process.exit(1);
  }

  await connection.end();
  console.log("🔌 Database connection pool closed.");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
