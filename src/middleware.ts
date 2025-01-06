import { defineMiddleware } from "astro:middleware";

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware(async (context, next) => {
    // Load user from session
    context.locals.user = await context.session.get('user');

    // Initialize user methods
    context.locals.getUser = function() { return context.locals.user; };
    context.locals.logout = async function() { 
        context.locals.user = null;
        await context.session.destroy();
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