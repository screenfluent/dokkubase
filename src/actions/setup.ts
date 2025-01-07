// Framework
import { defineAction } from 'astro:actions';
import type { APIContext } from 'astro';

// External libraries
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Internal imports
import { db, settings, sessions } from '@/db';
import { CSRF, logger } from '@/lib/security';
import { AUTH } from '@/lib/constants';
import type { ActionResponse } from '@/lib/types';

// Setup schema
const setupSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
    token: z.string(),
    _csrf: z.string()
});

// Types
type SetupInput = z.infer<typeof setupSchema>;

// Setup actions
export const setup = {
    configure: defineAction({
        accept: 'form',
        input: setupSchema,
        handler: async (input: SetupInput, context: APIContext): Promise<ActionResponse> => {
            const ip = context.request.headers.get('x-forwarded-for') || 'unknown';

            try {
                // Validate CSRF token
                const storedToken = context.cookies.get(CSRF.getConfig().cookie.name)?.value;
                if (!storedToken || !CSRF.validateToken(input._csrf, storedToken)) {
                    logger.security('Invalid CSRF token during setup', { ip });
                    return {
                        success: false,
                        error: 'Invalid security token'
                    };
                }

                // Validate setup token
                if (input.token !== import.meta.env.SETUP_TOKEN) {
                    logger.security('Invalid setup token', { ip });
                    return {
                        success: false,
                        error: 'Invalid setup token'
                    };
                }

                // Check if already configured
                const adminExists = await db.query.settings.findFirst({
                    where: eq(settings.key, 'admin_password_hash')
                });

                if (adminExists) {
                    logger.security('Setup attempted when configured', { ip });
                    return {
                        success: false,
                        error: 'System is already configured'
                    };
                }

                // Hash password and store it
                const passwordHash = await bcrypt.hash(input.password, 10);
                await db.insert(settings).values({
                    key: 'admin_password_hash',
                    value: passwordHash,
                    updatedAt: new Date()
                });
                
                logger.security('Initial setup completed', { ip });

                // Create session for the admin
                const sessionId = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + AUTH.SESSION.MAX_AGE * 1000);
                
                const userData: App.User = {
                    username: 'admin',
                    role: 'admin',
                    isLoggedIn: true,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };

                await db.insert(sessions).values({
                    id: sessionId,
                    data: JSON.stringify(userData),
                    expiresAt
                });

                // Set session cookie
                context.cookies.set(AUTH.COOKIE_NAME, sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    expires: expiresAt
                });
                
                return {
                    success: true,
                    message: 'Setup completed successfully',
                    data: {
                        redirectTo: '/'
                    }
                };
            } catch (err) {
                logger.error('Setup error', { 
                    ip,
                    error: err instanceof Error ? err.message : 'Unknown error'
                });
                
                return {
                    success: false,
                    error: 'An error occurred during setup'
                };
            }
        }
    })
};

// Export for Astro
export const server = { setup }; 