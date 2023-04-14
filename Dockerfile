# Base Stage
FROM node:18-alpine3.15 AS base

WORKDIR /home/node/app

ENV NODE_ENV="development"
ENV CI=true

RUN apk add -u --no-cache \
	dumb-init \
	fontconfig \
	jq \
	nodejs

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarn/ .yarn/
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node static/ static/
COPY --chown=node:node svelte.config.js .
COPY --chown=node:node vite.config.ts .

ENTRYPOINT [ "dumb-init", "--" ]

# Build Stage
FROM base AS builder

WORKDIR /home/node/app

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.json tsconfig.json
RUN yarn install --immutable

COPY --chown=node:node src/ src/
RUN yarn run build

# Runner Stage
FROM base AS runner

WORKDIR /home/node/app

ENV NODE_ENV="production"

COPY --chown=node:node --from=builder /home/node/app/build build

RUN yarn workspaces focus --all --production
RUN chown node:node /home/node/app

USER node

ENV CI=
CMD [ "yarn", "node", "build" ]