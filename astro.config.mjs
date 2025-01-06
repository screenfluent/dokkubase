// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',  // Enable SSR mode
  adapter: node({ mode: 'standalone' }),
  experimental: {
    session: {
      driver: "fs",
      cookie: {
        name: "dokkubase-session",
        sameSite: "strict"
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
