// Simple in-memory rate limiting
// - Stores login attempts per IP
// - Resets after 1 minute
// - Max 5 attempts per minute

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
            console.log(`Rate limit: Cleaned up ${cleaned} old entries`);
        }
    }

    // Check and increment attempt counter
    static checkAndAdd(ip: string): boolean {
        const now = Date.now();
        const data = attempts.get(ip);

        // First attempt for this IP
        if (!data) {
            console.log(`Rate limit: First attempt from ${ip}`);
            attempts.set(ip, { count: 1, firstAttempt: now });
            return true;
        }

        // Reset after 1 minute
        if (now - data.firstAttempt > 60 * 1000) {
            console.log(`Rate limit: Reset counter for ${ip}`);
            attempts.set(ip, { count: 1, firstAttempt: now });
            return true;
        }

        // Too many attempts
        if (data.count >= 5) {
            console.log(`Rate limit: Too many attempts from ${ip} (${data.count})`);
            return false;
        }

        // Increment counter
        data.count++;
        console.log(`Rate limit: Attempt ${data.count}/5 from ${ip}`);
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