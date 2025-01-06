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
            console.log('Login successful, setting session');
            
            // Store user data in session
            await context.session?.set('user', {
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