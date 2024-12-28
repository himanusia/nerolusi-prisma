# Gunakan base image Bun resmi
FROM oven/bun:latest

WORKDIR /app

COPY prisma ./

COPY bun.lockb package.json ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "start"]
