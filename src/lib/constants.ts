// Auth
export const AUTH = {
    COOKIE_NAME: 'sid',
    SESSION: {
        MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
        CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    RATE_LIMIT: {
        MAX_ATTEMPTS: 5,
        WINDOW: 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    PATHS: {
        SETUP: ['/setup', '/api/setup'] as const,
        PUBLIC: [
            '/setup', 
            '/api/setup', 
            '/auth/login', 
            '/error',
            '/favicon.ico',
            '/apple-touch-icon.png',
            '/apple-touch-icon-precomposed.png'
        ] as const,
        RATE_LIMITED: ['/auth/login', '/api/setup'] as const,
        NO_AUTH: ['/setup', '/auth/login', '/error'] as const
    }
} as const;

// Path types for type safety
export type SetupPath = typeof AUTH.PATHS.SETUP[number];
export type PublicPath = typeof AUTH.PATHS.PUBLIC[number];
export type RateLimitedPath = typeof AUTH.PATHS.RATE_LIMITED[number];
export type NoAuthPath = typeof AUTH.PATHS.NO_AUTH[number]; 