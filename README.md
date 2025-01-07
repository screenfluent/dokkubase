# DokkuBase 🚀

Self-hosted web GUI that connects to and manages Dokku server via SSH.

## Features

- 🔒 Secure authentication with rate limiting
- 🛡️ CSRF protection and session management
- 📝 Clean and simple setup process
- 🚀 Fast and lightweight

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 5.x (SSR mode)
- **Database**: SQLite (via better-sqlite3)
- **Auth**: Custom session-based auth
- **Styling**: Native CSS (KISS principle)

## Project Structure

```
src/
┣ actions/          # Server actions (auth, setup)
┃ ┣ auth.ts        # Authentication logic
┃ ┣ index.ts       # Actions barrel file
┃ ┗ setup.ts       # Initial setup logic
┣ components/       # UI components
┃ ┣ auth/          # Auth-related components
┃ ┗ setup/         # Setup-related components
┣ db/              # Database layer
┃ ┣ index.ts       # DB connection & exports
┃ ┣ migrate.ts     # DB migrations
┃ ┗ schema.ts      # DB schema (Drizzle ORM)
┣ lib/             # Shared utilities
┃ ┣ security/      # Security features
┃ ┃ ┣ csrf.ts      # CSRF protection
┃ ┃ ┣ logger.ts    # Security logging
┃ ┃ ┗ rate-limit.ts # Rate limiting
┃ ┣ constants.ts   # Shared constants
┃ ┣ types.ts       # Internal types
┃ ┗ utils.ts       # Helper functions
┣ pages/           # Routes & pages
┃ ┣ auth/          # Auth routes
┃ ┣ dashboard.astro # Main dashboard
┃ ┣ error.astro    # Error page
┃ ┣ index.astro    # Home page
┃ ┗ setup.astro    # Setup page
┣ entrypoint.ts    # App initialization
┗ env.d.ts         # TypeScript declarations
```

## Development

1. Clone the repo
2. Install dependencies:
```bash
npm install
```

3. Run setup script:
```bash
npm run setup
```

4. Start development server:
```bash
npm run dev
```

5. Visit setup URL (shown in console)

## Security Features

- 🔒 Session-based authentication
- 🛡️ CSRF protection for forms
- 🚫 Rate limiting for sensitive endpoints
- 📝 Security logging
- 🔐 Secure cookie settings
- 🛑 XSS protection via Astro

## Production

1. Build the app:
```bash
npm run build
```

2. Run install script:
```bash
npm run install:prod
```

## License

MIT
