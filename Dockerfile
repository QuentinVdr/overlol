# Use the official Node.js 24 runtime as a parent image
FROM node:24-alpine AS base
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Define build arguments for private environment variables
ARG NEXT_RIOT_API_KEY
# Add any other private variables your app needs during build

# Make them available as environment variables during build
ENV NEXT_RIOT_API_KEY=$NEXT_RIOT_API_KEY

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and config files first (for better caching)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY next.config.ts tsconfig.json postcss.config.mjs tailwind.config.* ./
COPY drizzle.config.ts ./

# Copy source code
COPY src ./src

# Setup database and build application
RUN corepack enable pnpm && pnpm run db:ci && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl g++ make python3 && \
	addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs && \
	mkdir public && \
	mkdir .next && \
	chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database files
COPY --from=builder --chown=nextjs:nodejs /app/src/db ./src/db
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Create overlay storage directory and set permissions
RUN mkdir -p .overlay-storage && \
	chown nextjs:nodejs .overlay-storage

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
