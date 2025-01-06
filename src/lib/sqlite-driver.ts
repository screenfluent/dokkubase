import Database from 'better-sqlite3';
import path from 'path';

interface SessionDriver {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
}

interface SessionRow {
    data: string;
    expires_at: number;
}

export class SQLiteSessionDriver implements SessionDriver {
    private db: Database.Database;

    constructor() {
        // Use data directory for database
        const dbPath = path.join(process.cwd(), 'data', 'sessions.db');
        console.log('SQLite Driver: Using database at', dbPath);
        
        this.db = new Database(dbPath);
        
        // Create sessions table if it doesn't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `);

        // Optional: Clean up expired sessions on startup
        this.cleanup();
    }

    async get(key: string): Promise<any> {
        console.log('SQLite Driver: Getting session', key);
        const row = this.db.prepare<[string, number], SessionRow>(
            'SELECT data FROM sessions WHERE id = ? AND expires_at > ?'
        ).get(key, Date.now());
        
        if (row) {
            console.log('SQLite Driver: Found session data');
            return JSON.parse(row.data);
        }
        
        console.log('SQLite Driver: No session found');
        return undefined;
    }

    async set(key: string, value: any): Promise<void> {
        console.log('SQLite Driver: Setting session', key);
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24h
        
        this.db.prepare(`
            INSERT OR REPLACE INTO sessions (id, data, expires_at)
            VALUES (?, ?, ?)
        `).run(key, JSON.stringify(value), expiresAt);
        
        console.log('SQLite Driver: Session saved');
    }

    async delete(key: string): Promise<void> {
        console.log('SQLite Driver: Deleting session', key);
        this.db.prepare('DELETE FROM sessions WHERE id = ?').run(key);
    }

    // Clean up expired sessions
    private cleanup(): void {
        const deleted = this.db.prepare(
            'DELETE FROM sessions WHERE expires_at <= ?'
        ).run(Date.now());
        
        if (deleted.changes > 0) {
            console.log(`SQLite Driver: Cleaned up ${deleted.changes} expired sessions`);
        }
    }
} 