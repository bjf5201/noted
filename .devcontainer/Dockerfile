FROM mcr.microsoft.com/devcontainers/typescript-node:24
# Enable Corepack so we can use the version of pnpm specified
# by the project.
RUN corepack enable && \
	  corepack prepare pnpm@latest-11 --activate

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
ENV PNPM_HOME="/pnpm"
ENV PATH=$PNPM_HOME:$PATH

RUN mkdir -p /pnpm && \
    chown node:node /pnpm
