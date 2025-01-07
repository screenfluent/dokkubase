import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Settings table
 * Stores application settings like admin password hash
 */
export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

/**
 * Sessions table
 * Stores active user sessions
 */
export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    data: text('data').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Export types for type safety
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert; 