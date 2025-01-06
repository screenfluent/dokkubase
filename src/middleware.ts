import { defineMiddleware } from "astro:middleware";

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware(async (context, next) => {
    // Check if sessions are configured
    if (!context.session) {
        throw new Error('Sessions are not configured');
    }

    // Store session reference for later use
    const session = context.session;

    // Load user from session
    const sessionUser = await session.get('user');
    context.locals.user = sessionUser || null;

    // Initialize user methods
    context.locals.getUser = function() { return context.locals.user; };
    context.locals.logout = async function() { 
        context.locals.user = null;
        await session.destroy();
    };

    // Skip auth check for login page and public routes
    if (context.url.pathname === '/login') {
        return next();
    }

    // Check if user is logged in
    const user = context.locals.getUser();
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        return context.redirect('/login');
    }

    return next();
}); 