// Framework
import { defineAction } from 'astro:actions';

// Node built-ins
import crypto from 'crypto';

// External libraries
import { z } from 'zod';

// Internal imports
import { DB } from '@/lib/db';

// Auth constants
export const COOKIE_NAME = 'sid';
const COOKIE_OPTIONS = 'Path=/; HttpOnly; SameSite=Strict; Max-Age=86400';

export interface User {
    username: string;
    isLoggedIn: boolean;
}

export const auth = {
    login: defineAction({
        accept: 'form',
        input: z.object({
            username: z.string(),
            password: z.string()
        }),
        handler: async (input, context) => {
            const { username, password } = input;

            // Simple hardcoded auth for prototype
            if (username === 'admin' && password === 'admin123') {
                console.log('Login successful, creating session');
                
                // Generate session ID
                const sessionId = crypto.randomBytes(32).toString('hex');
                
                // Store session in DB
                const db = DB.getInstance();
                db.setSession(sessionId, {
                    username: 'admin',
                    isLoggedIn: true
                } as User);

                // Set cookie
                context.cookies.set(COOKIE_NAME, sessionId, { 
                    httpOnly: true,
                    path: '/',
                    sameSite: 'strict',
                    maxAge: 86400 // 24h
                });

                console.log('Session created and stored in DB');

                return {
                    success: true,
                    message: 'Login successful'
                };
            }

            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
    }),

    logout: defineAction({
        accept: 'form',
        handler: async (_, context) => {
            const sessionId = context.cookies.get(COOKIE_NAME)?.value;
            
            if (sessionId) {
                // Clear session from DB
                const db = DB.getInstance();
                db.deleteSession(sessionId);
                
                // Clear cookie
                context.cookies.delete(COOKIE_NAME);
                
                console.log('Session cleared');
            }
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
        }
    })
}; 