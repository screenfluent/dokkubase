import { defineAction } from 'astro:actions';
import { z } from 'zod';

export const login = defineAction({
    input: z.object({
        username: z.string(),
        password: z.string()
    }),
    handler: async (input, context) => {
        const { username, password } = input;

        // Simple hardcoded auth for prototype
        if (username === 'admin' && password === 'admin123') {
            // Store user data in session
            if (!context.session) {
                throw new Error('Sessions are not configured');
            }

            await context.session.set('user', {
                username: 'admin',
                isLoggedIn: true
            });

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