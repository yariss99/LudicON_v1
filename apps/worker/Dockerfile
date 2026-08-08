# syntax=docker/dockerfile:1
#
# @ludicon/worker — BullMQ background processor.
#
# Build from the REPO ROOT, not from apps/worker:
#     docker build -f apps/worker/Dockerfile --target runtime .
#
# Targets:
#   dev      tsx watch
#   runtime  non-root, production dependencies only
#
# No port is exposed: the worker only ever dials out to Redis.
#
# ── Why the runtime runs TypeScript ──────────────────────────────────────────
# `@ludicon/contracts` publishes TypeScript source (`main` points at
# `./src/index.ts`), so a plain `tsc` build of this app emits JavaScript that
# still imports `.ts` files through the workspace symlinks — not runnable by
# node on its own. tsx strips the types at load time instead. The `build` stage
# below still runs `tsc`, purely as a compile gate: a type error fails the image
# build. When the workspace packages ship build output, this can become
# `node dist/apps/worker/src/index.js` with no other changes.

ARG NODE_IMAGE=node:22-alpine

# ─────────────────────────────────────────────────────────────────────────────
# manifests — every workspace package.json, and nothing else.
#
# Shared by both install stages, so the two `npm ci` runs below sit on top of
# one cached layer that only invalidates when a manifest actually changes.
# ─────────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS manifests
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

# ─────────────────────────────────────────────────────────────────────────────
# deps / prod-deps
# ─────────────────────────────────────────────────────────────────────────────
FROM manifests AS deps
RUN --mount=type=cache,target=/root/.npm npm ci

FROM manifests AS prod-deps
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# dev — tsx watch. Compose bind-mounts the repo over the copied sources.
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS dev
WORKDIR /repo
COPY . .
CMD ["npm", "run", "dev", "--workspace", "@ludicon/worker"]

# ─────────────────────────────────────────────────────────────────────────────
# build — compile gate only; the emitted JavaScript is not shipped.
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /repo

COPY tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker

RUN npm run build --workspace @ludicon/worker

# ─────────────────────────────────────────────────────────────────────────────
# runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runtime
WORKDIR /repo

ENV NODE_ENV=production \
    npm_config_update_notifier=false

COPY --from=prod-deps --chown=node:node /repo/node_modules ./node_modules
COPY --from=build     --chown=node:node /repo/package.json /repo/.npmrc ./
COPY --from=build     --chown=node:node /repo/tsconfig.base.json ./
COPY --from=build     --chown=node:node /repo/packages ./packages
COPY --from=build     --chown=node:node /repo/apps/worker ./apps/worker

USER node

# `node` is PID 1 — no npm or shell in between. This is deliberate: Compose
# sends SIGTERM to PID 1, and the graceful-shutdown handler in src/index.ts has
# to receive it directly. Wrapping this in `npm run` would put the signal
# handling at the mercy of npm's child-process forwarding.
CMD ["node", "--import", "tsx", "apps/worker/src/index.ts"]
