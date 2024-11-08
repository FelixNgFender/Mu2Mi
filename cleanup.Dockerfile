FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN ["npm", "pkg", "delete", "scripts.prepare"]
# RUN [ "npm", "ci",  "--omit=dev" ]
RUN [ "npm", "i" ]

FROM base AS cleanup
WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY package.json .
COPY scripts scripts
ARG ENABLE_ALPINE_PRIVATE_NETWORKING
ENV NODE_ENV=production
USER node
CMD [ "node", "scripts/cron-monthly-cleanup.mjs" ]
