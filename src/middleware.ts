import { defineMiddleware } from "astro:middleware";

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware(async (context, next) => {
    console.log('Middleware: Processing request to', context.url.pathname);

    if (!context.session) {
        throw new Error('Session not available');
    }

    // Load user from session
    const user = await context.session.get('user');
    console.log('Middleware: User from session:', user);

    // Skip auth check for login page
    if (context.url.pathname === '/login') {
        return next();
    }

    // Check if user is logged in
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        return context.redirect('/login');
    }

    return next();
}); 