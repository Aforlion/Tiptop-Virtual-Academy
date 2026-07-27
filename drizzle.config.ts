import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./domains/shared/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
    ssl: { rejectUnauthorized: false },
  },
});
