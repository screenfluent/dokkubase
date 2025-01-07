// Simple in-memory rate limiting
// - Stores login attempts per IP
// - Resets after 1 minute
// - Max 5 attempts per minute

import { logger } from './logger';

const attempts = new Map<string, { count: number; firstAttempt: number }>();

export class RateLimit {
    // Cleanup old entries
    static cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [ip, data] of attempts) {
            if (now - data.firstAttempt > 60 * 1000) {
                attempts.delete(ip);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            logger.security('Rate limit cleanup', { cleanedEntries: cleaned });
        }
    }

    // Check and increment attempt counter
    static checkAndAdd(ip: string): boolean {
        const now = Date.now();
        const data = attempts.get(ip);

        // First attempt for this IP
        if (!data) {
            logger.security('First login attempt', { ip });
            attempts.set(ip, { count: 1, firstAttempt: now });
            return true;
        }

        // Reset after 1 minute
        if (now - data.firstAttempt > 60 * 1000) {
            logger.security('Rate limit reset', { ip, previousAttempts: data.count });
            attempts.set(ip, { count: 1, firstAttempt: now });
            return true;
        }

        // Too many attempts
        if (data.count >= 5) {
            logger.security('Rate limit exceeded', { 
                ip, 
                attempts: data.count,
                firstAttempt: new Date(data.firstAttempt).toISOString()
            });
            return false;
        }

        // Increment counter
        data.count++;
        logger.security('Login attempt counted', { 
            ip, 
            currentAttempts: data.count,
            maxAttempts: 5
        });
        return true;
    }

    // Get remaining attempts
    static getRemainingAttempts(ip: string): number {
        const data = attempts.get(ip);
        if (!data) return 5;
        
        // Reset after 1 minute
        if (Date.now() - data.firstAttempt > 60 * 1000) {
            return 5;
        }

        return Math.max(0, 5 - data.count);
    }
} 