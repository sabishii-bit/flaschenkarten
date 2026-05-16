FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies for all workspace packages
FROM base AS installer
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds

# Build shared and server
FROM base AS builder
WORKDIR /app
COPY --from=installer /app ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN pnpm --filter @flaschenkarten/shared build
RUN pnpm --filter @flaschenkarten/server build
RUN pnpm deploy --filter @flaschenkarten/server --prod /deploy

# Final slim image
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /deploy .
EXPOSE 3000
CMD ["node", "dist/index.js"]
