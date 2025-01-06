import { defineMiddleware } from "astro:middleware";
import type { AppLocals } from '@/env';

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware(async (context, next) => {
    // Initialize all locals at the start
    const locals: AppLocals = {
        user: null,
        getUser: function() { return this.user; },
        logout: function() { this.user = null; }
    };

    // Assign to context
    context.locals = locals as App.Locals;

    // Skip auth check for login page and public routes
    if (context.url.pathname === '/login') {
        return next();
    }

    // Check if user is logged in
    const user = (context.locals as AppLocals).getUser();
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        return context.redirect('/login');
    }

    return next();
}); 