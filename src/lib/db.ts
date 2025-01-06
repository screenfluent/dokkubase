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

    // Singleton pattern - zawsze mamy jedną instancję bazy
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
        
        // Tu możemy dodawać więcej tabel w przyszłości
    }

    // Generic query methods
    public prepare<T = any>(sql: string) {
        return this.db.prepare(sql);
    }

    public exec(sql: string): void {
        this.db.exec(sql);
    }

    // Session methods - możemy je później przenieść do osobnego modułu jak urośnie aplikacja
    public getSession(id: string): any {
        const row = this.db.prepare<[string, number]>(
            'SELECT data FROM sessions WHERE id = ? AND expires_at > ?'
        ).get(id, Date.now()) as { data: string } | undefined;
        
        return row ? JSON.parse(row.data) : null;
    }

    public setSession(id: string, data: any, expiresIn: number = 24 * 60 * 60 * 1000): void {
        const expiresAt = Date.now() + expiresIn;
        
        this.db.prepare(`
            INSERT OR REPLACE INTO sessions (id, data, expires_at)
            VALUES (?, ?, ?)
        `).run(id, JSON.stringify(data), expiresAt);
    }

    public deleteSession(id: string): void {
        this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    }

    public cleanupSessions(): void {
        const deleted = this.db.prepare(
            'DELETE FROM sessions WHERE expires_at <= ?'
        ).run(Date.now());
        
        if (deleted.changes > 0) {
            console.log(`DB: Cleaned up ${deleted.changes} expired sessions`);
        }
    }
} 