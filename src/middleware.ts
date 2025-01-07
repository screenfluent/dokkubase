// Framework
import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, APIContext } from "astro";

// Internal imports
import { DB } from "@/lib/db";
import { COOKIE_NAME } from "@/actions/auth";
import { CSRF, RateLimit, logger } from "@/lib/security";

// Simple validation for session ID (should be 64 char hex)
function isValidSessionId(id: string | undefined): boolean {
    return Boolean(id && /^[a-f0-9]{64}$/.test(id));
}

// Cleanup rate limit entries every minute
setInterval(() => RateLimit.cleanup(), 60 * 1000);

// Simple auth middleware - MVP prototype
export const onRequest: MiddlewareHandler = defineMiddleware(async (context: APIContext, next: () => Promise<Response>) => {
    const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
    
    logger.security('Processing request', { 
        ip,
        method: context.request.method,
        path: context.url.pathname
    });

    try {
        // Generate CSRF token for all GET requests
        if (context.request.method === 'GET') {
            const token = CSRF.generateToken();
            const config = CSRF.getConfig();
            
            context.cookies.set(config.cookie.name, token, config.cookie);
            context.locals.csrfToken = token;
            
            logger.security('CSRF token generated', { ip });
        }

        // Rate limiting for login attempts
        if (context.url.pathname === '/auth/login' && context.request.method === 'POST') {
            if (!RateLimit.checkAndAdd(ip)) {
                logger.security('Rate limit blocked request', { ip, path: context.url.pathname });
                return new Response('Too many login attempts. Please try again in 1 minute.', {
                    status: 429
                });
            }

            // Add remaining attempts to locals for the login page
            context.locals.loginError = {
                remainingAttempts: RateLimit.getRemainingAttempts(ip)
            };
        }

        // Get and validate session from cookie
        const sessionId = context.cookies.get(COOKIE_NAME)?.value;
        if (sessionId) {
            if (!isValidSessionId(sessionId)) {
                logger.security('Invalid session ID format', { ip, sessionId: sessionId.slice(0, 8) });
                context.cookies.delete(COOKIE_NAME);
                return context.redirect('/auth/login');
            }
            
            // Get user data from DB if session exists
            const db = DB.getInstance();
            const user = db.getSession<App.User>(sessionId);
            
            if (user) {
                logger.auth('Session accessed', { 
                    ip,
                    sessionId: sessionId.slice(0, 8),
                    username: user.username
                });
                
                // Redirect logged-in users from login page to dashboard
                if (user.isLoggedIn && context.url.pathname === '/auth/login') {
                    return context.redirect('/dashboard');
                }
                
                // Add user to locals for all routes
                context.locals.user = user;
            }
        }

        // Call the next middleware/route handler
        const response = await next();

        // Log successful requests to sensitive endpoints
        if (context.url.pathname.startsWith('/auth/')) {
            logger.security('Auth endpoint accessed', { 
                ip,
                method: context.request.method,
                path: context.url.pathname,
                status: response.status
            });
        }

        return response;
    } catch (err) {
        logger.error('Middleware error', {
            ip,
            path: context.url.pathname,
            error: err instanceof Error ? err.message : 'Unknown error'
        });

        return new Response('Internal Server Error', { status: 500 });
    }
}); 