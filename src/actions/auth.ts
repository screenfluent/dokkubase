import { defineAction } from 'astro:actions';
import { z } from 'zod';

// Define error types
const LoginError = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

// Simple login action that checks against hardcoded credentials
export const login = defineAction({
  accept: 'form',
  input: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
  async handler({ username, password }) {
    try {
      // Hardcoded credentials for prototype
      const VALID_USERNAME = 'admin';
      const VALID_PASSWORD = 'admin123';

      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        return {
          success: true,
          data: {
            username,
            message: 'Login successful'
          }
        };
      }

      return {
        success: false,
        error: {
          code: LoginError.INVALID_CREDENTIALS,
          message: 'Invalid credentials'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: LoginError.SERVER_ERROR,
          message: 'Something went wrong. Please try again.'
        }
      };
    }
  },
}); 