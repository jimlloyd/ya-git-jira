# ya-git-jira Docker image
# Provides gitj/git-jira/git-lab/git-confluence/git-bump commands
# without requiring bun installed on the host.
#
# Build:
#   docker build -t gitj .
#
# Usage:
#   docker run --rm \
#     --user "$(id -u):$(id -g)" \
#     -e HOME="$HOME" \
#     -v "$HOME:$HOME" \
#     -v "$(pwd):$(pwd)" -w "$(pwd)" \
#     gitj <command> [args...]
#
# Examples:
#   docker run --rm --user "$(id -u):$(id -g)" -e HOME="$HOME" -v "$HOME:$HOME" -v "$(pwd):$(pwd)" -w "$(pwd)" gitj jira start
#   docker run --rm --user "$(id -u):$(id -g)" -e HOME="$HOME" -v "$HOME:$HOME" -v "$(pwd):$(pwd)" -w "$(pwd)" gitj lab merge active

FROM oven/bun:1 AS builder

WORKDIR /build

# Install dependencies first (cache layer)
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production --ignore-scripts

# Copy source and build
COPY build.ts index.ts tsconfig.json ./
COPY bin/ bin/
COPY lib/ lib/
RUN mkdir -p target && bun run build.ts

# --- Export stage ---
# Extracts the standalone gitj binary to the host via:
#   docker buildx build --output type=local,dest=./target --target export .
FROM scratch AS export
COPY --from=builder /build/target/gitj /gitj

# --- Runtime stage ---
FROM oven/bun:1-slim

# git is required - the tool reads config from git and operates on repos
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /build/dist/ dist/
COPY --from=builder /build/node_modules/ node_modules/
COPY package.json ./

# Include skill files so install-skills can copy them into projects
COPY .opencode/skills/ .opencode/skills/

# Symlink all bin entries onto PATH
RUN mkdir -p /usr/local/bin && \
    for f in dist/bin/*.js; do \
        name=$(basename "$f" .js); \
        ln -s /app/"$f" /usr/local/bin/"$name"; \
    done

ENTRYPOINT ["gitj"]
