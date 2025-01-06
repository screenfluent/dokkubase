import { defineAction } from 'astro:actions';
import { z } from 'zod';

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
            // Store user data in session
            if (!context.session) {
                console.error('No session available!');
                throw new Error('Sessions are not configured');
            }

            const userData = {
                username: 'admin',
                isLoggedIn: true
            };

            console.log('Setting user in session:', userData);
            await context.session.set('user', userData);
            console.log('User set in session');

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