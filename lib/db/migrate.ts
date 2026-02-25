import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
config({
  path: ".env.local",
});
import { existsSync } from "node:fs";
import { log } from "node:console";
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

  const connection = postgres(process.env.POSTGRES_URL, {
    max: 1,
    connect_timeout: 10,
    // Add SSL support since RDS often requires it
    ssl: 'require',
  });
  const db = drizzle(connection);

  console.log("📡 Attempting to connect to database...");

  try {
    await connection`SELECT 1`;
    console.log("✅ Database connection established successfully.");
  } catch (error: any) {
    console.error("❌ Failed to connect to the database:");
    if (error.message.includes('no encryption') || error.code === '28000') {
      console.error("\n👉 REASON: RDS requires an SSL connection.");
      console.error("   I have updated the script to force SSL.");
    } else if (error.code === 'CONNECT_TIMEOUT' || error.errno === 'ETIMEDOUT') {
      console.error("\n👉 REASON: Networking/Firewall issue. Check Security Groups.");
    }
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
  console.error("❌ Unexpected error during migration process:");
  console.error(err);
  process.exit(1);
});

