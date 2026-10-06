# Noted Markdown App

Noted is a work in progress.

## 1. Quickstart

### Requirements

- Node.js `24.18.0`
- pnpm

1. Clone the repository:

   ```sh
   git clone git@github.com:bjf5201/noted.git
   cd noted
   ```

2. Open the folder in VS Code and choose **Reopen in Container** when prompted. The Dev Container installs dependencies and starts the local Postgres service.

3. Create local configuration files as described in [Configuration](#2-configuration).

4. Start the development server:

   ```sh
   pnpm run dev
   ```

To work outside the Dev Container, install dependencies with `pnpm install` and configure a reachable Postgres database in your local environment.

## 2. Configuration

### Env files

Use separate files for shared local defaults, personal overrides, and tests:

- `.env.sample` is the tracked template. It must contain placeholders or disposable sample values, never real credentials.
- `.env` contains local shared/default values.
- `.env.local` contains personal development overrides.
- `.env.test` contains test-only overrides and should select the dedicated `noted_test` database.
- Production values come from the deployment environment or secret manager, not local env files.

The `.env`, `.env.local`, and `.env.test` files are ignored by Git. Copy `.env.sample` to `.env`, then create `.env.local` and `.env.test` as needed. Verify variable names against the application configuration; `COOKIE_SECRET` is required. Never commit real secrets. If Git already tracks a sensitive file, `.gitignore` does not untrack it; use `git rm --cached <file>` and rotate any exposed credentials.

### Precedence

The development scripts load `.env` followed by `.env.local`. The test script loads `.env` followed by `.env.test`. Later files override earlier files for duplicate keys, but variables already present in the shell or container environment take precedence over values loaded from files.

The Fastify env plugin validates `process.env` and exposes the result as `fastify.config`. It does not load another env file. If an environment value is unexpected, check whether it is already set:

```sh
printenv VARIABLE_NAME
```

For a one-off check without an inherited value:

```sh
env -u VARIABLE_NAME pnpm run test
```

### Docker Compose and the Dev Container

Docker Compose configures containers before the application process starts. In this repository, the app service receives `POSTGRES_HOST=postgres` and `POSTGRES_PORT=5432`. The Postgres service uses Compose interpolation for its initialization settings, with defaults including `POSTGRES_DB=noted_dev`.

Compose configuration and Node's `--env-file` options are separate. A Node env-file option cannot replace a value already present in the app container. The Postgres image uses `POSTGRES_DB` when it initializes its data directory; changing that setting later does not create or rename a database in an existing volume. Create the test database separately as described under [Testing](#4-testing).

## 3. Development Commands

| Command                 | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `pnpm run dev`          | Run the server in watch mode with `.env` and `.env.local`. |
| `pnpm run start`        | Run the server once with `.env` and `.env.local`.          |
| `pnpm run typecheck`    | Type-check the project.                                    |
| `pnpm run lint:check`   | Check lint rules without applying fixes.                   |
| `pnpm run format:check` | Check formatting.                                          |
| `pnpm run build`        | Compile the project into `dist`.                           |

## 4. Testing

Run tests with:

```sh
pnpm run test
```

The test command loads `.env` followed by `.env.test`. Keep `.env.test` pointed at the dedicated test database, not your development or production database.

### Test database setup

For a new test database, create it, apply migrations, seed the baseline users, then run tests:

```sh
pnpm run db:create:t
pnpm run db:migrate:t
pnpm run db:seed:t
pnpm run test
```

Skip `db:create:t` if the database already exists. Run migrations when the schema changes. Seed after creating or resetting the test database, or whenever baseline users need to be restored.

**Warning:** `db:seed:t` truncates the user and role tables before inserting its baseline users. Run it only against `noted_test`, never against a development or production database. Seeding requires `CAN_SEED_DATABASE=1`, normally set in `.env`.

## 5. Production

Provide required configuration through the deployment environment or a secret manager. Do not use `.env.local` or `.env.test` in production, and do not use `pnpm run start` as a production command because it explicitly loads local env files.

Build with:

```sh
pnpm run build
```

This repository does not currently define a production-specific start script. Establish and verify the production runtime command as part of deployment configuration. The environment must provide the required database and cookie settings.

## 6. Troubleshooting: WSL SSH Forwarding

When using VS Code with WSL, Git operations in the Dev Container may need access to the SSH agent.

Inside the Dev Container, check whether an agent socket is available:

```sh
echo "$SSH_AUTH_SOCK"
```

If the output is empty, check that your SSH agent is running in WSL and that VS Code is forwarding it. Then test GitHub authentication from the container:

```sh
ssh -T git@github.com
```

A successful connection reports that authentication succeeded and that GitHub does not provide shell access.
