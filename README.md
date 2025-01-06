# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 🤖 AI Assistant Instructions

When working with this codebase, please follow these guidelines:

### Astro Actions and TypeScript

1. **Imports**: Always use these exact imports for actions and middleware:
```typescript
// For actions
import { defineAction } from 'astro:actions';
import type { APIContext } from 'astro';

// For middleware
import { defineMiddleware } from 'astro:middleware';
import type { MiddlewareHandler, APIContext } from 'astro';
```

2. **Type Declarations**: Do not modify `src/env.d.ts`. It already has correct module declarations:
```typescript
declare module 'astro:middleware' {
    export { defineMiddleware, MiddlewareResponseHandler } from 'astro';
}

declare module 'astro:actions' {
    export { defineAction } from 'astro';
}
```

3. **Action Types**: Always use these type patterns:
```typescript
defineAction({
    accept: 'form',
    input: z.object({ /* your schema */ }),
    handler: async (input: YourInputType, context: APIContext) => {
        // your code
    }
});
```

4. **Middleware Types**: Always use this pattern:
```typescript
export const onRequest: MiddlewareHandler = defineMiddleware(
    async (context: APIContext, next: () => Promise<Response>) => {
        // your code
    }
);
```

5. **DO NOT**:
- Add `astro-*` or `@astrojs/*` imports for core functionality
- Modify existing type declarations
- Use any other patterns for actions/middleware

Follow these patterns exactly to maintain type safety and prevent import errors.
