// Export all security features
export * from './csrf';
export * from './rate-limit';

// Types
export interface SecurityConfig {
    csrf: import('./csrf').CSRFConfig;
    rateLimit: {
        maxAttempts: number;
        windowMs: number;
    };
    // Future security features:
    // headers?: SecureHeadersConfig;
    // csp?: ContentSecurityPolicyConfig;
    // xss?: XSSProtectionConfig;
    // ipWhitelist?: IPWhitelistConfig;
}

// Re-export types for convenience
export type { CSRFConfig } from './csrf'; 