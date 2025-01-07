// Export all security features
export * from './csrf';
export * from './rate-limit';
export { logger } from './logger';

// Re-export types for convenience
export type CSRFConfig = App.SecurityConfig['csrf'];

/*
 * Future security features to implement:
 * 1. Secure Headers
 *    - X-Content-Type-Options
 *    - X-Frame-Options
 *    - X-XSS-Protection
 *    - Strict-Transport-Security
 * 
 * 2. Content Security Policy (CSP)
 *    - Define allowed sources
 *    - Prevent XSS attacks
 * 
 * 3. XSS Protection
 *    - Input sanitization
 *    - Output encoding
 * 
 * 4. IP Whitelist/Blacklist
 *    - Allow/block specific IPs
 *    - Rate limiting by IP range
 */ 