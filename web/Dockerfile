# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies ----
FROM base AS deps
RUN npm ci

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Provide dummy build-time env vars so Next.js can collect page data
# Real values are injected at runtime via docker-compose / k8s
ARG SESSION_SECRET_KEY=build-time-placeholder
ENV SESSION_SECRET_KEY=${SESSION_SECRET_KEY}

RUN npm run build

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output (requires output: 'standalone' in next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
