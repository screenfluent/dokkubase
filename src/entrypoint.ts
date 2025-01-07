// Database initialization
import { DB } from '@/lib/db';

// Initialize all app services
export function initializeApp() {
    // Initialize database
    const db = DB.getInstance();
    
    // Setup periodic session cleanup
    setInterval(() => {
        db.cleanupSessions();
    }, 60 * 60 * 1000); // Every hour
    
    console.log('App initialized successfully');
}

// Call initialization on app start
initializeApp(); 