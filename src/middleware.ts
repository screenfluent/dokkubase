// Framework
import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, APIContext } from "astro";

// Internal imports
import { DB } from "@/lib/db";
import { COOKIE_NAME } from "@/actions/auth";
import { RateLimit } from "@/lib/rate-limit";

// Types
import type { User } from "@/actions/auth";

// Simple validation for session ID (should be 64 char hex)
function isValidSessionId(id: string | undefined): boolean {
    return Boolean(id && /^[a-f0-9]{64}$/.test(id));
}

// Cleanup rate limit entries every minute
setInterval(() => RateLimit.cleanup(), 60 * 1000);

// Simple auth middleware - MVP prototype
export const onRequest: MiddlewareHandler = defineMiddleware(async (context: APIContext, next: () => Promise<Response>) => {
    console.log('Middleware: Processing request to', context.url.pathname);

    // Rate limiting for login attempts
    if (context.url.pathname === '/auth/login' && context.request.method === 'POST') {
        const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
        
        if (!RateLimit.checkAndAdd(ip)) {
            context.locals.loginError = {
                message: 'Too many login attempts. Please try again in 1 minute.',
                remainingAttempts: 0
            };
            return context.redirect('/auth/login');
        }

        // Add remaining attempts to locals for the login page
        context.locals.loginError = {
            remainingAttempts: RateLimit.getRemainingAttempts(ip)
        };
    }

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

    // Add user to locals for all routes
    context.locals.user = user;

    return next();
}); 