import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create SQLite client
const sqlite = new Database('data/dokkubase.db');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from './schema'; 