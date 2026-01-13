FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json nest-cli.json ./

RUN npm install --legacy-peer-deps

COPY src ./src

RUN npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
