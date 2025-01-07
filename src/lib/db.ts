import Database from 'better-sqlite3';
import { logger } from './security';

// PROTOTYPE: Simple SQLite setup for MVP
// - Database is created in data/dokkubase.db
// - Tables are created on app start
// - No migrations needed for prototype
export class DB {
    private static instance: DB;
    private db: Database.Database;

    private constructor() {
        this.db = new Database('data/dokkubase.db');
        this.init();
    }

    private init() {
        try {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    expires_at INTEGER NOT NULL
                )
            `);
            logger.security('Database initialized');
        } catch (err) {
            logger.error('Database initialization failed', { 
                error: err instanceof Error ? err.message : 'Unknown error' 
            });
        }
    }

    // Singleton pattern - always return the same instance
    public static getInstance(): DB {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }

    // Generic query methods with proper typing
    public prepare<TParams extends any[] = any[]>(sql: string): Database.Statement<TParams> {
        return this.db.prepare(sql);
    }

    public exec(sql: string): void {
        this.db.exec(sql);
    }

    // Session methods - can be moved to a separate module when the app grows
    public getSession<T = unknown>(id: string): T | null {
        try {
            const now = Date.now();
            const row = this.db.prepare<[string, number]>(
                'SELECT data, expires_at FROM sessions WHERE id = ? AND expires_at > ?'
            ).get(id, now) as { data: string; expires_at: number } | undefined;
            
            if (!row) {
                logger.auth('Session not found or expired', { sessionId: id });
                return null;
            }
            
            logger.auth('Session retrieved', { 
                sessionId: id, 
                expiresAt: new Date(row.expires_at).toISOString() 
            });
            
            return JSON.parse(row.data);
        } catch (err) {
            logger.error('Failed to get session', { 
                sessionId: id, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            });
            throw err;
        }
    }

    public setSession<T = unknown>(id: string, data: T, expiresIn: number = 24 * 60 * 60 * 1000): void {
        try {
            const expiresAt = Date.now() + expiresIn;
            
            this.db.prepare(`
                INSERT OR REPLACE INTO sessions (id, data, expires_at)
                VALUES (?, ?, ?)
            `).run(id, JSON.stringify(data), expiresAt);

            logger.auth('Session created', { sessionId: id, expiresAt: new Date(expiresAt).toISOString() });
        } catch (err) {
            logger.error('Failed to set session', { 
                sessionId: id, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            });
            throw err;
        }
    }

    public deleteSession(id: string): void {
        try {
            const result = this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
            logger.auth('Session deleted', { sessionId: id, wasDeleted: result.changes > 0 });
        } catch (err) {
            logger.error('Failed to delete session', { 
                sessionId: id, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            });
            throw err;
        }
    }

    public getActiveSessionsCount(): number {
        try {
            const result = this.db.prepare(
                'SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?'
            ).get(Date.now()) as { count: number };
            
            logger.security('Active sessions counted', { count: result.count });
            return result.count;
        } catch (err) {
            logger.error('Failed to count active sessions', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            throw err;
        }
    }

    public cleanupSessions(): { deletedCount: number } {
        try {
            const before = this.getActiveSessionsCount();
            
            const result = this.db.prepare(
                'DELETE FROM sessions WHERE expires_at <= ?'
            ).run(Date.now());

            const after = this.getActiveSessionsCount();
            
            logger.security('Sessions cleanup completed', { 
                beforeCount: before,
                afterCount: after,
                deletedCount: result.changes
            });

            return { deletedCount: result.changes };
        } catch (err) {
            logger.error('Failed to cleanup sessions', { 
                error: err instanceof Error ? err.message : 'Unknown error' 
            });
            throw err;
        }
    }
} 