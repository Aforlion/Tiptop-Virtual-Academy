// domains/shared/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

// Create pg client for Node.js environments (local dev server & server side runs)
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Prevent crash on hot reload connections limit
let isConnected = false;
async function getDb() {
  if (!isConnected) {
    try {
      await pgClient.connect();
      isConnected = true;
    } catch (err) {
      console.error("Database connection connection failed:", err);
    }
  }
  return drizzle(pgClient, { schema });
}

export const dbPromise = getDb();
export { schema };
