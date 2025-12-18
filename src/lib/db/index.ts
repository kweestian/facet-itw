import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { resolve } from "path";

// Handle DATABASE_URL - remove "file:" prefix if present, resolve relative paths
let dbPath = process.env.DATABASE_URL || "./dev.db";
dbPath = dbPath.replace(/^file:/, "");

// Resolve relative paths to absolute
if (!dbPath.startsWith("/")) {
  dbPath = resolve(process.cwd(), dbPath);
}

const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export { schema };
