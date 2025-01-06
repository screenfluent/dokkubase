import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { DB } from '@/lib/db';
import crypto from 'crypto';
import { COOKIE_NAME } from '@/lib/constants';

export interface User {
    username: string;
    isLoggedIn: boolean;
}

export const login = defineAction({
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
});

export const logout = defineAction({
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
}); 