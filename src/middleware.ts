import { defineMiddleware } from "astro:middleware";

// Simple auth middleware - MVP prototype
export const onRequest = defineMiddleware(async (context, next) => {
    console.log('Middleware: Processing request to', context.url.pathname);

    // Check if sessions are configured
    if (!context.session) {
        console.error('No session available in middleware!');
        throw new Error('Sessions are not configured');
    }

    // Store session reference for later use
    const session = context.session;

    // Load user from session
    console.log('Middleware: Loading user from session...');
    const sessionUser = await session.get('user');
    console.log('Middleware: Session user:', sessionUser);
    
    context.locals.user = sessionUser || null;

    // Initialize user methods
    context.locals.getUser = function() { return context.locals.user; };
    context.locals.logout = async function() { 
        context.locals.user = null;
        await session.destroy();
    };

    // Skip auth check for login page and public routes
    if (context.url.pathname === '/login') {
        console.log('Middleware: Skipping auth check for login page');
        return next();
    }

    // Check if user is logged in
    const user = context.locals.getUser();
    console.log('Middleware: Current user:', user);
    
    if (!user?.isLoggedIn && context.url.pathname === '/dashboard') {
        console.log('Middleware: User not logged in, redirecting to login');
        return context.redirect('/login');
    }

    console.log('Middleware: Proceeding with request');
    return next();
}); 