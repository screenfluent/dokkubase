// Database initialization
import { db, sessions } from '@/db';
import { lt } from 'drizzle-orm';

// Initialize all app services
export function initializeApp() {
    // Setup periodic session cleanup
    setInterval(async () => {
        try {
            await db.delete(sessions)
                .where(lt(sessions.expiresAt, new Date()));
        } catch (error) {
            console.error('Session cleanup failed:', error);
        }
    }, 60 * 60 * 1000); // Every hour
    
    console.log('App initialized successfully');
}

// Call initialization on app start
initializeApp(); 