import Database from 'better-sqlite3';
import path from 'path';

// PROTOTYPE: Simple SQLite setup for MVP
// - Database is created in data/dokkubase.db
// - Tables are created on app start
// - No migrations needed for prototype
export class DB {
    private db: Database.Database;
    private static instance: DB;

    private constructor() {
        const dbPath = path.join(process.cwd(), 'data', 'dokkubase.db');
        console.log('DB: Initializing database at', dbPath);
        
        this.db = new Database(dbPath);
        
        // Initialize tables
        this.initTables();
    }

    // Singleton pattern - always return the same instance
    public static getInstance(): DB {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }

    private initTables(): void {
        // Sessions table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `);
        
        // More tables can be added here in the future
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
        const now = Date.now();
        const row = this.db.prepare<[string, number]>(
            'SELECT data, expires_at FROM sessions WHERE id = ? AND expires_at > ?'
        ).get(id, now) as { data: string; expires_at: number } | undefined;
        
        if (!row) {
            console.log(`DB: Session ${id.slice(0, 8)}... check failed:`);
            console.log(`- Current time: ${new Date(now).toISOString()}`);
            
            // Sprawdźmy czy sesja w ogóle istnieje
            const session = this.db.prepare('SELECT expires_at FROM sessions WHERE id = ?')
                .get(id) as { expires_at: number } | undefined;
            
            if (session) {
                console.log(`- Found expired session that expired at: ${new Date(session.expires_at).toISOString()}`);
            } else {
                console.log(`- No session found with this ID`);
            }
            return null;
        }
        
        console.log(`DB: Session ${id.slice(0, 8)}... retrieved successfully:`);
        console.log(`- Current time: ${new Date(now).toISOString()}`);
        console.log(`- Expires at: ${new Date(row.expires_at).toISOString()}`);
        console.log(`- TTL: ${(row.expires_at - now) / 1000 / 60} minutes remaining`);
        
        return JSON.parse(row.data);
    }

    public setSession<T = unknown>(id: string, data: T, expiresIn: number = 24 * 60 * 60 * 1000): void {
        const expiresAt = Date.now() + expiresIn;
        
        this.db.prepare(`
            INSERT OR REPLACE INTO sessions (id, data, expires_at)
            VALUES (?, ?, ?)
        `).run(id, JSON.stringify(data), expiresAt);

        console.log(`DB: Session ${id.slice(0, 8)}... stored:`);
        console.log(`- Current time: ${new Date(Date.now()).toISOString()}`);
        console.log(`- Expires at: ${new Date(expiresAt).toISOString()}`);
        console.log(`- TTL: ${expiresIn / 1000 / 60} minutes`);
    }

    public deleteSession(id: string): void {
        const result = this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
        console.log(`DB: Session ${id.slice(0, 8)}... ${result.changes ? 'deleted' : 'not found'}`);
    }

    public getActiveSessionsCount(): number {
        const result = this.db.prepare(
            'SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?'
        ).get(Date.now()) as { count: number };
        
        return result.count;
    }

    public cleanupSessions(): { deletedCount: number } {
        const before = this.getActiveSessionsCount();
        const deleted = this.db.prepare(
            'DELETE FROM sessions WHERE expires_at <= ?'
        ).run(Date.now());
        const after = this.getActiveSessionsCount();
        
        console.log(`DB: Session cleanup at ${new Date().toISOString()}:`);
        console.log(`- Before: ${before} active sessions`);
        console.log(`- Deleted: ${deleted.changes} expired sessions`);
        console.log(`- After: ${after} active sessions`);

        return { deletedCount: deleted.changes };
    }
} 