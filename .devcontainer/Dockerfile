ARG VARIANT=26-trixie
FROM node:${VARIANT}

ARG USERNAME=node

# Set locale so Unicode characters render correctly in locale-aware tools
# (e.g. tmux).
ENV LANG=C.UTF-8

# Set working directory
WORKDIR /workspace

# Install packages commonly required for native Node modules.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
        build-essential \
        git \
        curl \
        jq \
        openssl \
        python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add node user to docker group for socket access
RUN groupadd -g 999 docker || true && \
    usermod -aG docker ${USERNAME} || true

# Install and enable Corepack to use the
# version of pnpm specified by the project
RUN npm install -g corepack -y
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Create PNPM_HOME and add pnpm to PATH
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH=${PNPM_HOME}:${PATH}

# Create pnpm store directory
RUN mkdir -p ${PNPM_HOME} \
    && chown ${USERNAME}:${USERNAME} ${PNPM_HOME} \
    && chmod 755 ${PNPM_HOME}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=22
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# Change to NODE_MODULES arg to packages you want installed,
# Ensure each package is separated by a space
# ARG NODE_MODULES="eslint typescript"
# RUN su node -c "umask 0002 && pnpm add -g ${NODE_MODULES}" \
#    && pnpm cache clean --force > /dev/null 2>&1
