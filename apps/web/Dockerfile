# syntax=docker/dockerfile:1
#
# @ludicon/web — Vite React SPA.
#
# Build from the REPO ROOT, not from apps/web:
#     docker build -f apps/web/Dockerfile --target runtime .
# npm workspaces resolve from the root `package.json` + `package-lock.json`, so
# the whole workspace has to be in the build context.
#
# Targets:
#   dev      Vite dev server with HMR on 5173
#   runtime  nginx serving the built `dist` on 5173 (same port as dev, so the
#            compose mapping does not change between them)

ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.31-alpine

# ─────────────────────────────────────────────────────────────────────────────
# deps — manifests only, then install.
#
# Copying just the workspace manifests before the sources means this layer (the
# expensive one) is reused on every build where no dependency changed. Editing
# a component does not reinstall node_modules.
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
# dev — Vite with hot reload.
#
# The sources are copied so the image runs standalone, but compose bind-mounts
# the repo over them so edits on the host are picked up live.
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS dev
WORKDIR /repo
COPY . .
EXPOSE 5173
# Stays root on purpose: compose bind-mounts the host repo over /repo, and a
# fixed container UID would collide with whatever owns the files on the host.
# The runtime target below is the one that ships, and it runs no Node at all.
CMD ["npm", "run", "dev", "--workspace", "@ludicon/web", "--", \
     "--host", "0.0.0.0", "--port", "5173"]

# ─────────────────────────────────────────────────────────────────────────────
# build — produce apps/web/dist.
#
# `VITE_`-prefixed values are inlined into the bundle at build time, so they
# arrive as build args rather than runtime env. Only publishable, non-secret
# values belong here — anything passed in is readable in the shipped JavaScript.
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /repo

COPY tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

ARG VITE_API_URL=""
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

RUN npm run build --workspace @ludicon/web

# ─────────────────────────────────────────────────────────────────────────────
# runtime — static files only. No Node, no npm, no source.
# ─────────────────────────────────────────────────────────────────────────────
FROM ${NGINX_IMAGE} AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:5173/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
