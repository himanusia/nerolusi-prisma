FROM oven/bun:1 AS builder
WORKDIR /app
COPY bun.lock package.json ./
COPY prisma ./prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
ARG DATABASE_URL
ARG AUTH_SECRET
ARG AUTH_URL
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV AUTH_URL=${AUTH_URL}
ENV AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
ENV AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bun.lock ./bun.lock
EXPOSE 3000
CMD ["bun", "run", "start"]