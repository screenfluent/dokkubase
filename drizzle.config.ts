import type { Config } from 'drizzle-kit';
import * as path from 'path';

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: path.join(process.cwd(), 'data/dokkubase.db')
    },
    verbose: true,
    strict: true
} satisfies Config; 