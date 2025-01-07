import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as path from 'path';

console.log('🚀 Starting database migration...');

try {
  const sqlite = new Database(path.join(process.cwd(), 'data/dokkubase.db'));
  const db = drizzle(sqlite);
  
  // Run migrations
  migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('✅ Migration completed successfully!');
  
  // Close the database connection
  sqlite.close();
} catch (error) {
  console.log('❌ Migration failed:', error);
  process.exit(1);
} 