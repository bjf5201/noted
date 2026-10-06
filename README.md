# Noted Markdown App

This project is in progress.

## Dev Setup

To work on this repo, follow the steps below.

1. Clone the repo to your local environment with `git clone git@github.com:bjf5201/noted.git`

2. Open with VSCode and select "Open in Container" when prompted. If using another editor, skip this step.

3. Begin editing!

## Test Setup

Create and migrate the dedicated test database when needed. Seed it before running tests that rely on the baseline users:

```sh
pnpm run db:create:t
pnpm run db:migrate:t
pnpm run db:seed:t
pnpm run test
```

`db:create:t` is needed only if the test database does not exist; db:migrate:t applies schema migrations. Run db:seed:t after creating or resetting the test database, or whenever the baseline users need to be restored. Seeding truncates the user and role tables first, so only run it against the dedicated test database, never your development or production database.

The seed script also requires `CAN_SEED_DATABASE=1`, which must be available from .env or the process environment. Use `pnpm run db:seed:t` rather than running the generic `db:seed` command so the script targets `noted_test`.

## Environment Configuration

Keep configuration specific to the environment that consumes it. Node loads application settings when a script starts; Docker Compose configures the containers and the Postgres service. These are separate steps, and a Compose value already present in a container cannot be replaced by Node's `--env-file` option.

### Env files

- `.env.sample` is the tracked template. It is for disposable local development only; replace sample credentials and secrets with local values. Never put real credentials in this file.
- `.env` contains local shared/default values and is ignored by Git.
- `.env.local` contains personal development overrides and is ignored by Git. The `dev` and `start` scripts load it after `.env`.
- `.env.test` contains test-only overrides and is ignored by Git. The `test` script loads it after `.env`; use a dedicated test database such as `noted_test`.
- Production configuration comes from the deployment environment or secret manager, not developer env files. Build with `pnpm run build` and run `node dist/server.js` so local env files are not loaded.

To create local files, copy `.env.sample` to `.env`, then create `.env.local` and `.env.test` as needed. Keep real secrets out of Git. `.gitignore` prevents new files from being tracked, but does not untrack a file already committed; use `git rm --cached <file>` to stop tracking one while keeping the local copy.

### Precedence and commands

The current commands select the app's env files explicitly:

```sh
pnpm run dev
pnpm run test
```

`dev` loads `.env` followed by `.env.local`; `test` loads `.env` followed by `.env.test`. For duplicate keys, the later file overrides the earlier file, but a variable already exported in the shell/container takes precedence over values in both files. Check inherited values with `printenv VARIABLE_NAME` when a value is unexpected. Remove the variable from the container/shell or run a one-off command with `env -u VARIABLE_NAME ...` when you need to verify file precedence.

The Fastify env plugin validates `process.env` and decorates `fastify.config`; it does not load another env file. This keeps the script's selected files as the source of application configuration.

### Dev Container and Postgres

The Compose `app` service provides infrastructure connection settings such as `POSTGRES_HOST` and `POSTGRES_PORT`. Application values such as `POSTGRES_DATABASE` and `COOKIE_SECRET` are loaded by the Node command, not injected into the app service by Compose.

The Postgres service's `POSTGRES_DB` is an initialization setting. The official image applies it when the data directory is first initialized; changing it later does not create or rename databases in an existing named volume. Create and migrate the test database separately with the test database commands when needed:

```sh
pnpm run db:create:t
pnpm run db:migrate:t
```

Compose interpolation (for example, `${POSTGRES_DATABASE:-noted_dev}` in `compose.yaml`) is separate from Node's `--env-file` loading. Keep Postgres service initialization values and application runtime values aligned, and do not assume a Node env-file flag changes the already-running container or its initialized database volume.

### SSH Agent Forwarding in WSL2

If you are working with VSCode on WSL2 as your dev environment, you will need to ensure that your SSH Agent is forwarded into the devcontainer in order to communicate with GitHub properly.

To ensure your ssh-agent is running, add the following code to your `.bash_profile` or `.profile` config:

```bash
# Create ssh-agent at startup
if [ -z "$SSH_AUTH_SOCK" ]; then
    # Check for a currently running instance of the agent
    RUNNING_AGENT="`ps -ax | grep 'ssh-agent -s' | grep -v grep | wc -l | tr -d '[:space:]'`"
    if [ "$RUNNING_AGENT" = "0" ]; then
        # Launch a new instance of the agent
        ssh-agent -s &> $HOME/.ssh/ssh-agent
    fi
    eval `cat $HOME/.ssh/ssh-agent`
fi

# Add key to this ssh-agent session.
# Running `ssh-add` without arguments automatically adds:
#   - ~/.ssh/id_rsa
#   - ~/.ssh/id_dsa
#   - ~/.ssh/id_ecdsa
#   - ~/.ssh/id_ecdsa_sk
#   - ~/.ssh/id_ed25519
#   - ~/.ssh/id_ed25519_sk
ssh-add

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include ~/.bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi
```

To ensure that VSCode has been forwarded the SSH agent, run the following _inside_ your devcontainer:

```bash
echo "$SSH_AUTH_SOCK"
```

If it is blank, the SSH agent has not be forwarded. Otherwise, proceed to the next check:

```bash
ssh -T git@github.com
```

You should recieve an output similar to: `Hi {username}! You've successfully authenticated, but GitHub does not provide shell access.`
