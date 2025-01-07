// Node built-ins
import crypto from 'crypto';

// Internal imports
import { logger } from './logger';

// Types
export interface CSRFConfig {
    cookie: {
        name: string;
        httpOnly: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        path: string;
    };
    formField: string;
}

// Default config
const DEFAULT_CONFIG: CSRFConfig = {
    cookie: {
        name: 'csrf',
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    },
    formField: '_csrf'
};

export class CSRF {
    private static config: CSRFConfig = DEFAULT_CONFIG;

    // Generate a new CSRF token (32 chars hex)
    static generateToken(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    // Validate token from form against stored token
    static validateToken(formToken: string | null, storedToken: string | null): boolean {
        if (!formToken || !storedToken) {
            logger.security('CSRF: Missing token(s)');
            return false;
        }

        const isValid = formToken === storedToken;
        logger.security(`CSRF: Token validation ${isValid ? 'passed' : 'failed'}`);
        return isValid;
    }

    // Get config
    static getConfig(): CSRFConfig {
        return this.config;
    }
} 