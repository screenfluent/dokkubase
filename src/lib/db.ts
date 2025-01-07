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
        const row = this.db.prepare<[string, number]>(
            'SELECT data FROM sessions WHERE id = ? AND expires_at > ?'
        ).get(id, Date.now()) as { data: string } | undefined;
        
        if (!row) {
            console.log(`DB: Session ${id.slice(0, 8)}... not found or expired`);
            return null;
        }
        
        console.log(`DB: Session ${id.slice(0, 8)}... retrieved successfully`);
        return JSON.parse(row.data);
    }

    public setSession<T = unknown>(id: string, data: T, expiresIn: number = 24 * 60 * 60 * 1000): void {
        const expiresAt = Date.now() + expiresIn;
        
        this.db.prepare(`
            INSERT OR REPLACE INTO sessions (id, data, expires_at)
            VALUES (?, ?, ?)
        `).run(id, JSON.stringify(data), expiresAt);

        console.log(`DB: Session ${id.slice(0, 8)}... stored, expires in ${expiresIn / 1000 / 60} minutes`);
    }

    public deleteSession(id: string): void {
        const result = this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
        console.log(`DB: Session ${id.slice(0, 8)}... ${result.changes ? 'deleted' : 'not found'}`);
    }

    public cleanupSessions(): { deletedCount: number } {
        const deleted = this.db.prepare(
            'DELETE FROM sessions WHERE expires_at <= ?'
        ).run(Date.now());
        
        if (deleted.changes > 0) {
            console.log(`DB: Cleaned up ${deleted.changes} expired sessions at ${new Date().toISOString()}`);
        }

        return { deletedCount: deleted.changes };
    }
} 