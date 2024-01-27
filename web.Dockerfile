FROM node:20-alpine as base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN ["npm", "pkg", "delete", "scripts.prepare"]
RUN ["npm", "ci"]

FROM base as development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER root
EXPOSE ${PORT}
ENV NODE_ENV=development
ENV RUNNING_IN_CLI=true
HEALTHCHECK --interval=1s --timeout=5s --retries=10 \
    CMD wget --spider -q ${PROTOCOL}://${HOST}:${PORT}/api/healthcheck || exit 1
RUN ["npx", "next", "telemetry", "disable"]
# CMD ["npx", "tsx", "src/server"]
CMD ["node", "/app/node_modules/.bin/tsx", "src/server"]

FROM base as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ["npm", "run", "build"]

FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV RUNNING_IN_CLI=true

RUN ["npx", "next", "telemetry", "disable"]
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME=${HOST}

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
