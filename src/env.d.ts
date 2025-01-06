/// <reference types="astro/client" />

declare module 'astro:middleware' {
    export { defineMiddleware, MiddlewareResponseHandler } from 'astro';
}

declare module 'astro:actions' {
    export { defineAction } from 'astro';
}

declare namespace App {
    interface Locals {
        user: {
            username: string;
            isLoggedIn: boolean;
        } | null;
        getUser: () => Locals['user'];
        logout: () => void;
    }
} 