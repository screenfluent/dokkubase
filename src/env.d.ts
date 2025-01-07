/// <reference types="astro/client" />

declare module 'astro:middleware' {
    export { defineMiddleware, MiddlewareResponseHandler } from 'astro';
}

declare module 'astro:actions' {
    export { defineAction, getActionContext } from 'astro';
    export type { APIContext } from 'astro';
}

// Define types for environment variables
interface ImportMetaEnv {
    /** Database configuration */
    readonly DATABASE_URL: string;
    /** Secret key for session encryption */
    readonly SESSION_SECRET: string;
    readonly SETUP_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    // User & Auth types
    interface User {
        username: string;
        isLoggedIn: boolean;
        createdAt?: string;
        lastLoginAt?: string;
        permissions?: string[];
        role: 'admin';
    }

    interface CookieOptions {
        httpOnly?: boolean;
        path?: string;
        sameSite?: 'strict' | 'lax' | 'none';
        maxAge?: number;
        secure?: boolean;
    }

    // API types
    interface ApiResponse {
        success: boolean;
        error?: string;
        message?: string;
        redirect?: string;
        data?: unknown;
    }

    interface ApiError {
        code: string;
        message: string;
        details?: unknown;
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

    // Session types
    interface Session {
        id: string;
        user: User;
        expiresAt: number;
    }

    interface LoginError {
        remainingAttempts?: number;
        message?: string;
    }

    // Locals for middleware
    interface Locals {
        csrfToken?: string;
        user?: User;
        loginError?: LoginError;
    }
}

// Extend Astro namespace to include our Locals
declare namespace Astro {
    interface Locals extends App.Locals {}
} 