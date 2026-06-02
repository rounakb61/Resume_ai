import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Re-export the schemas
export * from "./schema/index.js";

// Export the inferred types
export type Job = typeof schema.jobsTable.$inferSelect;
export type Candidate = typeof schema.candidatesTable.$inferSelect;
export type Application = typeof schema.applicationsTable.$inferSelect;
export type Interview = typeof schema.interviewsTable.$inferSelect;
export type Onboarding = typeof schema.onboardingTable.$inferSelect;
