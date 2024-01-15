FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .
RUN ["npm", "pkg", "delete", "scripts.prepare"]
RUN [ "npm", "ci",  "--omit=dev" ]

FROM node:20-alpine AS bucket-creation
WORKDIR /app
COPY --from=base /app/node_modules node_modules/
COPY package.json .
COPY scripts scripts
ENV NODE_ENV=production
USER node
CMD [ "node", "scripts/create-bucket.mjs" ]
