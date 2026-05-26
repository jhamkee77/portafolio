# =========================================================
# INDOR API — Multi-stage production image
# =========================================================

# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- Stage 2: build ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# ---------- Stage 3: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl tini && \
    addgroup -S indor && adduser -S indor -G indor

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=indor:indor /app/node_modules ./node_modules
COPY --from=build --chown=indor:indor /app/dist ./dist
COPY --from=build --chown=indor:indor /app/prisma ./prisma
COPY --from=build --chown=indor:indor /app/package.json ./package.json

USER indor
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
