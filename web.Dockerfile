FROM node:18-alpine as base
WORKDIR /app
COPY package.json package-lock.json ./
RUN ["npm", "pkg", "delete", "scripts.prepare"]
RUN ["npm", "ci"]
COPY . .


FROM base as development
EXPOSE ${PORT}
ENV NODE_ENV=development
ENV RUNNING_IN_CLI=true
USER root
HEALTHCHECK --interval=1s --timeout=5s --retries=10 \
    CMD wget --spider -q ${PROTOCOL}//${HOST}:${PORT}/api/healthcheck || exit 1
RUN ["npx", "next", "telemetry", "disable"]
# CMD ["npx", "tsx", "src/server"]
# node /app/node_modules/.bin/tsx src/server
CMD ["node", "/app/node_modules/.bin/tsx", "src/server"]
