import { auth } from '@/actions/auth';
import { setup } from '@/actions/setup';

// Export server object for Astro
export const server = {
    auth,
    setup
}; 