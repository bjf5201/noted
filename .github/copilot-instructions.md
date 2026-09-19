# Copilot instructions for noted (repo root)

## 1) Quick build / test / lint commands

- Install dependencies: `pnpm install`
- Dev server (live tsx): `pnpm run dev`
- Start (run once): `pnpm run start`
- Build (emit JS to `dist`): `pnpm run build`  # uses `tsconfig.build.json`
- Type-check: `pnpm run typecheck`
- Lint: `pnpm run lint`  (fixing mode)
- Lint check only: `pnpm run lint:check`
- Format: `pnpm run format`  (Prettier)
- Format check: `pnpm run format:check`
# Copilot instructions for noted

## Quick commands

- Install dependencies: `pnpm install`
- Development server: `pnpm run dev` (`tsx watch`, loads `.env.development.local`)
- Start server once: `pnpm run start`
- Type-check: `pnpm run typecheck`
- Lint check: `pnpm run lint:check`
- Lint and fix: `pnpm run lint`
- Format check: `pnpm run format:check`
- Format and fix: `pnpm run format`
- Run all tests: `pnpm run test`
- Build: `pnpm run build` (uses `tsconfig.build.json`)
- Run the full local check: `pnpm run check`

Tests use Node's built-in `node:test` runner through `tsx`, not Vitest. Run one file with, for example, `pnpm exec tsx --env-file=.env --env-file=.env.local --test test/routes/home.test.ts`. Run a test name with Node's `--test-name-pattern` option.

Database commands use Drizzle Kit and PostgreSQL. The usual migration flow is `pnpm run db:create`, `pnpm run db:migrate`, and `pnpm run db:seed`; use `pnpm run db:drop` only when intentionally removing the configured database. Environment variables are loaded from `.env` by database scripts and from `.env` **and** `.env.local` by the server.

The package requires Node `24.18.0` and uses pnpm. CI runs commitlint, format checking, lint, typecheck, tests, and build.

## Architecture

- `src/server.ts` is the standalone executable. It creates the Fastify instance, configures logging/timeouts/AJV, registers `webApp`, handles graceful shutdown, and listens on port `3000`.
- `src/app.ts` is the composition root. It autoloads plugins in this order: `src/plugins/external`, `src/plugins/app`, then `src/routes`. Routes are loaded with `autoHooks` and `cascadeHooks` enabled.
- Every autoloaded module should export a default Fastify plugin. Use `fastify-plugin` for plugins that decorate the Fastify instance or declare dependencies. Use `autoConfig` when a plugin needs autoload options.
- `src/plugins/external` contains infrastructure integrations: environment validation, Drizzle/Postgres, sessions/cookies, Swagger, and sensible HTTP helpers.
- `src/plugins/app` contains application services and instance/request decorations: authorization, password hashing/comparison, and the users repository.
- `src/routes` contains HTTP route plugins. `src/routes/home.ts` serves `/`; `src/routes/api/index.ts` serves `/api`; nested folders map to nested route prefixes. `src/routes/api/autohooks.ts` protects API routes except `/api/auth/login`.
- `src/database/schema.ts` is the Drizzle PostgreSQL schema. Migrations live in `src/database/migrations` and are generated/configured by `drizzle.config.js`.

## Conventions

- Preserve the package export map when adding or moving modules. Internal imports use the `noted/...` package aliases, usually with explicit `.js` extensions, such as `noted/app.js` or `noted/database/schema.js`.
- Use Fastify decorators for shared services and repositories. Add matching declaration merging in the plugin that owns the decoration, and declare plugin dependencies in `fastify-plugin` metadata when required.
- Keep plugin ordering and dependency names correct. External plugins must be available before app plugins, and app services must be registered before routes consume them. The Drizzle plugin depends on `env`; the users repository depends on `drizzle`.
- Use TypeBox schemas with `@fastify/type-provider-typebox` for route validation and OpenAPI metadata. Put reusable DTOs and response schemas in `src/schemas`, and attach route-specific schemas through the route's `schema` option.
- Do not rely on TypeScript types for runtime request validation. Fastify schemas validate requests and responses; handler generics provide compile-time types.
- Keep authentication and authorization behavior in plugins/hooks. Sessions expose `request.session.user`; authorization helpers are decorated on requests. Avoid duplicating access checks inside individual handlers when a route hook is the appropriate boundary.
- Keep database access in repositories or database-focused modules rather than embedding Drizzle queries throughout route handlers. Use the decorated `fastify.db` connection and close external resources with Fastify lifecycle hooks such as `onClose`.
- Tests use `buildTest()` from `test/helpers/setup.ts`, register `webApp` with `skipOverride: true`, and exercise HTTP behavior through `app.inject`. Close the app with the test context or in teardown. Use the login helpers when a test needs the configured session cookie.
- Prefer focused tests alongside the route or plugin behavior being changed. Existing tests are currently concentrated in `test/routes`; some user tests are skipped while that API is incomplete.

## Important files

- `src/app.ts` — plugin and route composition, global error handling
- `src/server.ts` — production/development process entrypoint and Fastify runtime options
- `src/plugins/external/env.ts` — required environment variables and defaults
- `src/plugins/external/drizzle.ts` — PostgreSQL connection and `fastify.db` decoration
- `src/plugins/external/session.ts` — cookie/session configuration and `request.session.user` typing
- `src/plugins/app/users/users-repository.ts` — user queries and `fastify.usersRepository`
- `src/routes/api/autohooks.ts` — API authentication gate
- `src/routes/api/user/index.ts` — user route schemas and handlers
- `src/schemas/*.ts` — TypeBox request/response schemas and shared types
- `src/database/schema.ts` and `src/database/migrations/*` — database model and migrations
- `test/helpers/setup.ts` — test app factory and authenticated injection helpers
- `package.json`, `drizzle.config.js`, `tsconfig*.json` — scripts, database tooling, and TypeScript configuration

When changing behavior, update the relevant plugin/route schema and add or adjust an `app.inject` test. Validate with the narrowest relevant test first, then run `pnpm run typecheck`, `pnpm run lint:check`, and `pnpm run format:check` as appropriate.
