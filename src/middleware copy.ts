// Framework
import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, APIContext } from "astro";

// Internal imports
import { db, sessions, settings } from "@/db";
import { CSRF, RateLimit, logger } from "@/lib/security";
import { AUTH } from "@/lib/constants";
import { eq } from "drizzle-orm";

// Simple validation for session ID (should be 64 char hex)
function isValidSessionId(id: string | undefined): boolean {
    return Boolean(id && /^[a-f0-9]{64}$/.test(id));
}

// Helper to check if path is in array with type safety
function isPathIn<T extends string>(path: string, paths: readonly T[]): path is T {
    return paths.includes(path as T);
}

// Cleanup rate limit entries periodically
setInterval(() => RateLimit.cleanup(), AUTH.SESSION.CLEANUP_INTERVAL);

export const onRequest: MiddlewareHandler = defineMiddleware(
    async (context: APIContext, next: () => Promise<Response>) => {
        // Destructure needed properties from context
        const { request, cookies, locals, redirect, isPrerendered } = context;

        // Skip requests for prerendered pages
        if (isPrerendered) return next();

        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // Check if system is configured
            const adminExists = await db.query.settings.findFirst({
                where: eq(settings.key, 'admin_password_hash')
            });
            
            // If not configured and not accessing setup or public paths
            if (!adminExists && !isPathIn(path, AUTH.PATHS.SETUP) && !isPathIn(path, AUTH.PATHS.PUBLIC)) {
                logger.security('Redirecting to setup', { ip, path });
                return redirect('/setup');
            }
            
            // If system is configured and trying to access setup
            if (adminExists && isPathIn(path, AUTH.PATHS.SETUP)) {
                logger.security('Setup accessed when configured', { ip });
                return redirect('/');
            }

            // Generate CSRF token for GET requests and login-related paths
            if (method === 'GET' || path === '/auth/login') {
                const token = CSRF.generateToken();
                const config = CSRF.getConfig();
                
                cookies.set(config.cookie.name, token, config.cookie);
                locals.csrfToken = token;
                
                logger.security('CSRF token generated', { ip });
            }

            // Rate limiting for sensitive POST endpoints
            if (method === 'POST' && isPathIn(path, AUTH.PATHS.RATE_LIMITED)) {
                if (!RateLimit.checkAndAdd(ip)) {
                    const message = path === '/auth/login' 
                        ? 'Too many login attempts. Please try again later.'
                        : 'Too Many Requests';
                        
                    logger.security('Rate limit exceeded', { ip, path });
                    
                    if (path === '/auth/login') {
                        locals.loginError = {
                            remainingAttempts: RateLimit.getRemainingAttempts(ip),
                            message
                        };
                        return redirect('/auth/login');
                    }
                    
                    return new Response(message, { status: 429 });
                }

                // Add remaining attempts info for login page
                if (path === '/auth/login') {
                    locals.loginError = {
                        remainingAttempts: RateLimit.getRemainingAttempts(ip)
                    };
                }
            }

            // Get and validate session from cookie
            const sessionId = cookies.get(AUTH.COOKIE_NAME)?.value;
            if (sessionId && isValidSessionId(sessionId)) {
                const session = await db.query.sessions.findFirst({
                    where: eq(sessions.id, sessionId)
                });

                if (session?.data) {
                    const userData = JSON.parse(session.data) as App.User;
                    
                    // Check session expiration
                    if (session.expiresAt < new Date()) {
                        logger.security('Session expired', { ip, sessionId: sessionId.slice(0, 8) });
                        await db.delete(sessions).where(eq(sessions.id, sessionId));
                        cookies.delete(AUTH.COOKIE_NAME);
                        return redirect('/auth/login');
                    }

                    // Add user to locals
                    locals.user = userData;
                }
            }

            // Call the next middleware/route handler
            const response = await next();

            // Log successful requests to sensitive endpoints
            if (path.startsWith('/auth/')) {
                logger.security('Auth endpoint accessed', { 
                    ip,
                    method,
                    path,
                    status: response.status
                });
            }

            return response;
        } catch (err) {
            logger.error('Middleware error', {
                ip,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            
            // Redirect to error page instead of returning 500
            return redirect('/error');
        }
    }
); 