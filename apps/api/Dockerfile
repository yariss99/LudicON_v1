# syntax=docker/dockerfile:1
#
# @ludicon/api — Hono on @hono/node-server.
#
# Build from the REPO ROOT, not from apps/api:
#     docker build -f apps/api/Dockerfile --target runtime .
#
# Targets:
#   dev      tsx watch, port 3000
#   runtime  non-root; runs pending migrations, then starts the server
#
# ── Why the runtime image keeps dev dependencies ─────────────────────────────
# The workspace packages (`@ludicon/domain`, `@ludicon/contracts`) publish
# TypeScript source — their `main` points at `./src/index.ts` — so the runtime
# executes TypeScript rather than compiled JavaScript, and needs whatever
# loader `apps/api`'s `start` script uses. At the time this file was written
# `apps/api/package.json` did not exist yet, so its dependency/devDependency
# split could not be verified; installing everything is the choice that cannot
# silently break.
#
# Switch the install below to `npm ci --omit=dev` once `apps/api/package.json`
# lists its runtime loader (tsx) and `drizzle-orm` under `dependencies`.
# Migrations themselves are already fine: `apps/api/src/db/migrate.ts` uses
# `drizzle-orm/node-postgres/migrator` programmatically, not the drizzle-kit CLI.

ARG NODE_IMAGE=node:22-alpine

# ─────────────────────────────────────────────────────────────────────────────
# deps — manifests only, then install. Cached until a manifest changes.
# ─────────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /repo
ENV CI=true \
    npm_config_update_notifier=false

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json          ./apps/api/
COPY apps/web/package.json          ./apps/web/
COPY apps/worker/package.json       ./apps/worker/
COPY packages/config/package.json      ./packages/config/
COPY packages/contracts/package.json   ./packages/contracts/
COPY packages/data-access/package.json ./packages/data-access/
COPY packages/domain/package.json      ./packages/domain/
COPY packages/ui/package.json          ./packages/ui/

RUN --mount=type=cache,target=/root/.npm npm ci

# ─────────────────────────────────────────────────────────────────────────────
# dev — tsx watch. Compose bind-mounts the repo over the copied sources.
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS dev
WORKDIR /repo
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace", "@ludicon/api"]

# ─────────────────────────────────────────────────────────────────────────────
# build — compile gate. Fails the image build on a type error rather than
# letting it reach production, even though the runtime executes TypeScript
# sources directly (see the note at the top).
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /repo

COPY tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build --workspace @ludicon/api

# ─────────────────────────────────────────────────────────────────────────────
# runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runtime
WORKDIR /repo

ENV NODE_ENV=production \
    PORT=3000 \
    npm_config_update_notifier=false

# node_modules first: it changes least often.
COPY --from=deps  --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/package.json /repo/.npmrc ./
COPY --from=build --chown=node:node /repo/tsconfig.base.json ./
COPY --from=build --chown=node:node /repo/packages ./packages
COPY --from=build --chown=node:node /repo/apps/api ./apps/api

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(()=>process.exit(0)).catch(()=>process.exit(1))"

# Migrations run to completion before the server accepts traffic. `exec` hands
# PID 1 to npm so Compose's SIGTERM reaches the server process (npm >= 9
# forwards signals to the script it spawns); `init: true` in compose reaps.
#
# Requires `apps/api/package.json` to define both `db:migrate` and `start`.
CMD ["sh", "-c", "npm run db:migrate --workspace @ludicon/api && exec npm run start --workspace @ludicon/api"]
