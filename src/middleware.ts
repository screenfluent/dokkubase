/**
 * Main middleware for handling security and session management.
 * 
 * Features:
 * - CSRF protection for forms
 * - Rate limiting for sensitive endpoints
 * - Session management and validation
 * - Form action handling
 * - Security logging
 */

// Framework imports
import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, APIContext } from "astro";
import { getActionContext } from 'astro:actions';

// Database imports
import { db, sessions } from "@/db";
import { eq } from "drizzle-orm";

// Security imports
import { CSRF, RateLimit, logger } from "@/lib/security";
import { AUTH } from "@/lib/constants";
import { isValidSessionId, isPathIn } from "@/lib/utils";

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
            // Generate CSRF token for all GET requests
            if (method === 'GET') {
                const token = CSRF.generateToken();
                const config = CSRF.getConfig();
                
                cookies.set(config.cookie.name, token, config.cookie);
                locals.csrfToken = token;
                
                logger.security('CSRF token generated', { ip });
            } else {
                // For POST, get existing token from cookie
                const token = cookies.get(CSRF.getConfig().cookie.name)?.value;
                if (token) {
                    locals.csrfToken = token;
                    logger.security('CSRF token retrieved from cookie', { ip });
                }
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

            // Skip session check for paths that don't require auth
            if (!isPathIn(path, AUTH.PATHS.NO_AUTH)) {
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
                    } else {
                        return redirect('/auth/login');
                    }
                } else {
                    return redirect('/auth/login');
                }
            }

            // Handle form actions - needs everything above
            const { action, setActionResult, serializeActionResult } = getActionContext(context);
            if (action?.calledFrom === 'form') {
                const result = await action.handler();
                setActionResult(action.name, serializeActionResult(result));
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