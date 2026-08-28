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
- Tests (vitest): `pnpm run test`
- Watch tests: `pnpm run test:watch`

Run a single test file:
- `pnpm exec vitest test/note/note.route.test.ts`

Run a single test by name/pattern:
- `pnpm exec vitest -t "returns empty array when no notes exist"`
- or: `pnpm run test -- -t "pattern"`

Notes about CI: `.github/workflows/ci.yaml` runs commitlint, format, lint, typecheck, tests, build. The repo uses `pnpm` (`packageManager`) and pins a Node engine in `package.json`.

## 2) High-level architecture (big picture)

- Entry: `src/index.ts` — creates a Better-SQLite3 DB (`data/notes.db`) and starts the Fastify server.
- App composition: `src/app.ts` — builds the Fastify instance, registers routes, and exposes a health root endpoint (`/`).
- Database layer: `src/database.ts` — thin wrapper around `better-sqlite3` that ensures the notes table exists. Tests use `createDatabase(':memory:')` for ephemeral DBs.
- Domain:
  - `src/note/*` — split into schema (TypeBox schemas), repository (SQL queries using `better-sqlite3`), controller (Fastify handlers), and routes (Fastify plugins). Routes are registered under prefix `/notes`.
  - `src/
- Types & validation: TypeBox schemas in `note.schema.ts` are used as Fastify route schemas with the TypeBox type provider (`@fastify/type-provider-typebox`).
- Tests: `test/*.test.ts` spin up the app with an in-memory DB and use `app.inject` for HTTP-like requests (no external server required).
- Build: `tsc` (`tsconfig.build.json`) outputs to `dist`; dev uses `tsx` to run TS directly.

## 3) Key repository conventions and patterns

- Import paths use the package export map (`package.json` `"exports"`): modules import using `'noted/...'` (e.g., `'noted/app.js'`). Keep exports in sync if files move.
- Database creation is idempotent: `createDatabase` ensures the notes table exists on startup. Tests must use `':memory:'` to avoid touching `data/notes.db`.
- Tests use `app.inject` and close the Fastify instance in `afterEach` to avoid cross-test interference.
- Native dependency builds: `pnpm-workspace.yaml` contains `allowBuilds` entries (`better-sqlite3`, `esbuild`). Builds may require native toolchain on CI / local machine.
- Node & pnpm versions: `package.json` sets the Node engine and `packageManager`; use matching versions in CI/devcontainer to avoid environment mismatches.

## 4) Domain/API Info

### Note

The Note route implementation is as follows:

App (`src/app.ts`) -> Note Route (`src/note/note.route.ts`) -> Note Controller (`src/note/note.controller.ts`) -> Note Repository (`src/note/note.route.ts`) -> Database (`src/database.ts`)

Additionally, the Note Route utilizes the Note Schema (`src/note/note.schema.ts`) to verify the shape of requests and responses, as appropriate.

- `src/note/note.schema.ts`: Note Schema utilizes TypeBox (`typebox`) with the Fastify TypeBox type provider (`@fastify/type-provider-typebox`)
- `src/note/note.repository.ts`: The repository API utilizes `createNotesRepository` which returns a plain object with methods: `listAll()`, `listById(noteId)`, `create(title, content)`. Keep SQL and returned shapes simple JSON-friendly objects (`noteId`, `title`, `content`).
- `src/note/note.controller.ts`: Controllers return Fastify responses and rely on route schemas for validation. Request bodies are cast in code; do not assume runtime typing without schema validation.
- `src/note/note.route.ts`: Routes export a Fastify plugin factory (function `notesRoutes(repo)`) which is then registered in `app.ts` with a prefix.

### User

The User route implementation is as follows:

App (`src/app.ts`) -> User Route (`src/user/user.route.ts`) -> User Controller (`src/user/user.controller.ts`) -> User Repository (`src/user/user.route.ts`) -> Database (`src/database.ts`)

Additionally, the User Route utilizes the User Schema (`src/user/user.schema.ts`) to verify the shape of requests and responses, as appropriate.

- `src/user/user.schema.ts`: User Schema utilizes TypeBox (`typebox`) with the Fastify TypeBox type provider (`@fastify/type-provider-typebox`)
- `src/user/user.repository.ts`: The repository API utilizes `createUsersRepository` which returns a plain object with the methods: `create()`, `getById(userId)`
  - Repository API is not complete. More methods are being added.
- `src/user/user.controller.ts`: Controllers return Fastify responses and rely on route schemas for validation. Request bodies are cast in code; do not assume runtime typing without schema validation.
- `src/user/user.route.ts`: Routes export a Fastify plugin factory (function `usersRoutes(repo)`) which is then registered in `app.ts` with a prefix.

## 4) Notable files to inspect when changing behavior

- `src/index.ts` — server entry and DB filename (`data/notes.db`)
- `src/app.ts` — route registration and root health endpoint
- `src/database.ts` — SQL schema; changing it affects all tooling and tests
- `src/note/*` — schema, repository, controller, route implementation for Note
- `src/user/*` - schema, repository, controller, route implementation for User
- `test/*` — example tests that demonstrate in-memory DB usage and `app.inject`
- `package.json` — scripts, exports, engines
- `.github/workflows/ci.yaml` — CI steps (commitlint, format, lint, typecheck, tests, build)
- `.husky/*` - Runs `lint-staged` (pre-commit steps, see line below) and sets up the pre-commit commit linting using the `commitlint` package
- `lint-staged.config.js` - Pre-commit steps (format, lint, typecheck)

## 5) Quick tips for Copilot sessions (short, actionable)

- Prefer edits that preserve the package `"exports"` mapping or update `package.json` together with code moves.
- When running tests locally, prefer `createDatabase(':memory:')` for unit tests to avoid persisting data to `data/notes.db`.
- When adding routes, add TypeBox schemas in `note.schema.ts` and wire them into the route's schema option.
- Work in a TDD fashion, adding failing tests first. Then, create enough code to make them pass. From there, iterate code to improve code quality/readability.
