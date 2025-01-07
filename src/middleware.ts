// Framework
import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, APIContext } from "astro";

// Internal imports
import { DB } from "@/lib/db";
import { COOKIE_NAME } from "@/actions/auth";

// Types
import type { User } from "@/actions/auth";

// Simple validation for session ID (should be 64 char hex)
function isValidSessionId(id: string | undefined): boolean {
    return Boolean(id && /^[a-f0-9]{64}$/.test(id));
}

// Simple auth middleware - MVP prototype
export const onRequest: MiddlewareHandler = defineMiddleware(async (context: APIContext, next: () => Promise<Response>) => {
    console.log('Middleware: Processing request to', context.url.pathname);

    // Get and validate session from cookie
    const sessionId = context.cookies.get(COOKIE_NAME)?.value;
    if (sessionId && !isValidSessionId(sessionId)) {
        console.log('Middleware: Invalid session ID detected, clearing cookie');
        context.cookies.delete(COOKIE_NAME);
        return context.redirect('/auth/login');
    }
    
    // Get user data from DB if session exists
    let user: User | null = null;
    if (sessionId) {
        const db = DB.getInstance();
        user = db.getSession(sessionId);
        // Log first 8 chars of session ID for debugging (safe to log)
        console.log(`Middleware: Session ${sessionId.slice(0, 8)}... accessed at ${new Date().toISOString()}`);
        console.log('Middleware: User from session:', user);
    }

    // Redirect logged-in users from login page to dashboard
    if (user?.isLoggedIn && context.url.pathname === '/auth/login') {
        return context.redirect('/dashboard');
    }

    // Redirect non-logged-in users from protected routes to login
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        return context.redirect('/auth/login');
    }

    // Add user to locals so it's available in components
    context.locals.user = user;

    return next();
}); 