// Database initialization
import { db, sessions } from '@/db';
import { lt } from 'drizzle-orm';
import { AUTH } from '@/lib/constants';
import { RateLimit } from '@/lib/security';

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
    }, AUTH.SESSION.CLEANUP_INTERVAL);
    
    // Setup periodic rate limit cleanup
    setInterval(() => RateLimit.cleanup(), AUTH.SESSION.CLEANUP_INTERVAL);
    
    console.log('App initialized successfully');
}

// Call initialization on app start
initializeApp(); 