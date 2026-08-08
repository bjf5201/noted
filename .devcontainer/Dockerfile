FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm
# Enable Corepack so we can use the version of pnpm specified
# by the project.
RUN corepack enable

# Install packages commonly required for native Node modules.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
				git \
				curl \
				jq \
				openssl \
        python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a directory for the pnpm store.
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH=$PNPM_HOME:$PATH

RUN mkdir -p "$PNPM_HOME" && \
    chown node:node "$PNPM_HOME"