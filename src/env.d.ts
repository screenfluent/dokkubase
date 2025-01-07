/// <reference types="astro/client" />

declare module 'astro:middleware' {
    export { defineMiddleware, MiddlewareResponseHandler } from 'astro';
}

declare module 'astro:actions' {
    export { defineAction } from 'astro';
}

// Define types for environment variables
interface ImportMetaEnv {
    /** Database configuration */
    readonly DATABASE_URL: string;
    /** Secret key for session encryption */
    readonly SESSION_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    // User & Auth types
    interface User {
        username: string;
        isLoggedIn: boolean;
    }

    interface CookieOptions {
        httpOnly?: boolean;
        path?: string;
        sameSite?: 'strict' | 'lax' | 'none';
        maxAge?: number;
        secure?: boolean;
    }

    // Security types
    interface SecurityConfig {
        csrf: {
            cookie: CookieOptions;
            headerName: string;
            tokenLength: number;
        };
        rateLimit: {
            maxAttempts: number;
            windowMs: number;
        };
    }

    // Locals for middleware
    interface Locals {
        user: User | null;
        loginError?: {
            message?: string;
            remainingAttempts: number;
        };
        csrfToken: string;
    }
} 