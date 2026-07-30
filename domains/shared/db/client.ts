// domains/shared/db/client.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Client } from "@neondatabase/serverless";
import * as schema from "./schema";

// Lazy initialize database connection to prevent build-time connection attempts
let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

export { schema };
export const dbPromise = getDb();
