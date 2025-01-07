/**
 * Helper to check if path is in array with type safety
 */
export function isPathIn<T extends string>(path: string, paths: readonly T[]): path is T {
    return paths.includes(path as T);
}

/**
 * Simple validation for session ID (should be 64 char hex)
 */
export function isValidSessionId(id: string | undefined): boolean {
    return Boolean(id && /^[a-f0-9]{64}$/.test(id));
} 