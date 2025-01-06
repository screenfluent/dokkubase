import { defineMiddleware } from "astro:middleware";

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware((context, next) => {
    // Initialize user state if not set
    if (typeof context.locals.user === 'undefined') {
        context.locals.user = null;
    }

    // Set up user methods if not defined
    if (typeof context.locals.getUser === 'undefined') {
        context.locals.getUser = function() { return context.locals.user; };
    }
    if (typeof context.locals.logout === 'undefined') {
        context.locals.logout = function() { context.locals.user = null; };
    }

    // Skip auth check for login page and public routes
    if (context.url.pathname === '/login') {
        return next();
    }

    // Check if user is logged in
    const user = context.locals.getUser();
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        return next('/login');
    }

    return next();
}); 