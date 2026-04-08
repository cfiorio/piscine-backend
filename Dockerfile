# ─── Stage 1 : build ────────────────────────────────────────────────────────
FROM node:lts-alpine AS builder

# Outils nécessaires pour compiler les modules natifs (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Installe uniquement les dépendances de production (recompile les natifs pour alpine)
RUN npm ci --only=production

# ─── Stage 2 : production ───────────────────────────────────────────────────
FROM node:lts-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 3000

# Exécution sans privilèges root
USER node

CMD ["node", "dist/server.js"]
