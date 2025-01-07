/**
 * Shared types for the application.
 * Internal types that are not part of the global App namespace.
 * For global types, see env.d.ts.
 */

/**
 * Response type for server actions.
 * Used by all actions to ensure consistent response format.
 */
export interface ActionResponse {
    success: boolean;
    error?: string;
    message?: string;
    data?: {
        redirectTo?: string;
    };
}

/**
 * Session data stored in the database.
 * Note: User data is stored as JSON string in 'data' field.
 */
export interface Session {
    id: string;
    data: string;
    expiresAt: Date;
}

/**
 * Settings stored in the database.
 * Used for application configuration (e.g. admin password hash).
 */
export interface Setting {
    key: string;
    value: string;
    updatedAt: Date;
} 