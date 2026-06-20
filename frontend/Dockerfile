# ── Build-time args ─────────────────────────────
ARG VERSION=1.0.0
ARG COMMIT=dev
ARG NEXT_PUBLIC_API_URL=http://localhost

# ── Dependencies stage ──────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Builder stage ───────────────────────────────
FROM node:20-alpine AS builder
ARG VERSION
ARG COMMIT
ARG NEXT_PUBLIC_API_URL

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_VERSION=${VERSION}

RUN npm run build

# ── Runtime stage ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV VERSION=${VERSION}
ENV COMMIT=${COMMIT}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
