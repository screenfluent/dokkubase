// Framework
import { defineAction } from 'astro:actions';
import type { APIContext } from 'astro';
import type { AstroCookies } from 'astro';

// Node built-ins
import crypto from 'crypto';

// External libraries
import { z } from 'zod';

// Internal imports
import { DB } from '@/lib/db';
import { CSRF } from '@/lib/security';
import { logger } from '../lib/security';

// Auth constants
export const COOKIE_NAME = 'sid' as const;

// Cookie helper types
interface CookieToSet {
    value: string;
    options: App.CookieOptions;
}

interface CookiesToSet {
    [COOKIE_NAME]: CookieToSet;
}

// Cookie helper function
export function setAuthCookiesFromResponse(cookies: CookiesToSet, astroCookies: AstroCookies) {
    Object.entries(cookies).forEach(([name, { value, options }]) => {
        astroCookies.set(name, value, options);
    });
}

// Login schema
const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    _csrf: z.string()
});

export const auth = {
    login: defineAction({
        accept: 'form',
        input: loginSchema,
        handler: async (input: z.infer<typeof loginSchema>, context: APIContext) => {
            const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
            
            // Validate CSRF token
            const storedToken = context.cookies.get(CSRF.getConfig().cookie.name)?.value;
            if (!storedToken || !CSRF.validateToken(input._csrf, storedToken)) {
                logger.security('Invalid CSRF token', { ip });
                return {
                    success: false,
                    error: 'Invalid security token'
                };
            }
            
            logger.auth('Login attempt', { ip, username: input.username });

            try {
                // Validate credentials (hardcoded for now)
                if (input.username !== 'admin' || input.password !== 'admin123') {
                    logger.auth('Login failed', { ip, username: input.username, reason: 'Invalid credentials' });
                    return {
                        success: false,
                        error: 'Invalid username or password'
                    };
                }

                // Generate session ID
                const sessionId = crypto.randomBytes(32).toString('hex');
                
                // Store session
                const db = DB.getInstance();
                db.setSession(sessionId, {
                    username: input.username,
                    isLoggedIn: true
                } satisfies App.User);

                // Set cookie
                context.cookies.set(COOKIE_NAME, sessionId, {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 // 7 days
                } satisfies App.CookieOptions);

                logger.auth('Login successful', { ip, username: input.username, sessionId });

                return {
                    success: true,
                    redirect: '/'
                };
            } catch (err) {
                logger.error('Login error', { 
                    ip, 
                    username: input.username,
                    error: err instanceof Error ? err.message : 'Unknown error'
                });
                
                return {
                    success: false,
                    error: 'An error occurred during login'
                };
            }
        }
    }),

    logout: defineAction({
        accept: 'form',
        handler: async (_: unknown, context: APIContext) => {
            const sessionId = context.cookies.get(COOKIE_NAME)?.value;
            const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
            
            if (sessionId) {
                // Clear session from DB
                const db = DB.getInstance();
                db.deleteSession(sessionId);
                
                // Clear cookie
                context.cookies.delete(COOKIE_NAME);
                
                logger.auth('User logged out', { ip, sessionId: sessionId.slice(0, 8) });
            }
            
            return {
                success: true,
                message: 'Logged out successfully',
                cookiesToSet: {
                    [COOKIE_NAME]: {
                        value: '',
                        options: {
                            httpOnly: true,
                            path: '/',
                            sameSite: 'strict',
                            maxAge: 0
                        } satisfies App.CookieOptions
                    }
                }
            };
        }
    })
}; 