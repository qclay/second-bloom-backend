FROM node:22-slim AS build
WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json nest-cli.json ./

RUN npm ci
COPY src ./src

RUN npx prisma generate && npm run build

FROM node:22-slim AS production
WORKDIR /app

RUN npm install -g npm@latest

RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nestjs

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]
