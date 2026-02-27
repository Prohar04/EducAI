# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies ----
FROM base AS deps
RUN npm ci --ignore-scripts

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (needs schema + node_modules)
RUN npx prisma generate

USER appuser

EXPOSE 8000

CMD ["npx", "tsx", "src/index.ts"]
