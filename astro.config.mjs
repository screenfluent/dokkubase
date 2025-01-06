// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { SQLiteSessionDriver } from './src/lib/sqlite-driver';

// https://astro.build/config
export default defineConfig({
  output: 'server',  // Enable SSR mode
  adapter: node({ mode: 'standalone' }),
  experimental: {
    session: {
      driver: new SQLiteSessionDriver()
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
