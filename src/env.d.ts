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
    interface Locals {
        user: {
            username: string;
            isLoggedIn: boolean;
        } | null;
        loginError?: {
            message?: string;
            remainingAttempts: number;
        };
    }
} 