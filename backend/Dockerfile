# --- 開発・本番 両対応 Dockerfile ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .

# --- 本番ビルド ---
FROM base AS build
RUN npm run build

# --- 本番実行用 ---
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.env ./
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate:deploy && node dist/index.js"]

# --- 開発用 ---
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate:deploy && npx ts-node-dev src/index.ts"]
