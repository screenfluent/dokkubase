// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',  // Enable SSR mode
  adapter: node({ mode: 'standalone' }),
  experimental: {
    session: {
      driver: "fs",  // Simple filesystem driver for development
      cookie: {
        name: "dokkubase-session",
        sameSite: "strict"  // Better security
      }
    }
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
});
