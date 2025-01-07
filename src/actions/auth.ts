// Framework
import { defineAction } from 'astro:actions';
import type { APIContext, AstroCookies } from 'astro';

// Node built-ins
import crypto from 'crypto';

// External libraries
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

// Internal imports
import { db, sessions, settings } from '@/db';
import { CSRF, logger } from '@/lib/security';

// Types
type LoginInput = z.infer<typeof loginSchema>;
type ActionResponse = {
    success: boolean;
    error?: string;
    redirect?: string;
};

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
        handler: async (input: LoginInput, context: APIContext): Promise<ActionResponse> => {
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
                // Check if system is configured
                const adminPassword = await db.query.settings.findFirst({
                    where: eq(settings.key, 'admin_password_hash')
                });

                if (!adminPassword) {
                    logger.security('Login attempt before setup', { ip });
                    return {
                        success: false,
                        error: 'System not configured',
                        redirect: '/setup'
                    };
                }

                // Validate credentials
                if (input.username !== 'admin' || !await bcrypt.compare(input.password, adminPassword.value)) {
                    logger.auth('Login failed', { ip, username: input.username, reason: 'Invalid credentials' });
                    return {
                        success: false,
                        error: 'Invalid username or password'
                    };
                }

                // Generate session ID
                const sessionId = crypto.randomBytes(32).toString('hex');
                
                // Store session
                await db.insert(sessions).values({
                    id: sessionId,
                    data: JSON.stringify({
                        username: input.username,
                        isLoggedIn: true
                    } satisfies App.User),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                });

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
                await db.delete(sessions).where(eq(sessions.id, sessionId));
                
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