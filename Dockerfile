FROM oven/bun:latest

WORKDIR /app

# Install OpenSSL and PostgreSQL client
RUN apt-get update -y && apt-get install -y openssl postgresql-client

# Copy prisma schema first
COPY prisma ./prisma/

# Copy package files
COPY bun.lockb package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Waiting for database to be ready..."\n\
until pg_isready -h db -p 5432 -U postgres; do\n\
  echo "Database is unavailable - sleeping"\n\
  sleep 2\n\
done\n\
echo "Database is ready!"\n\
echo "Running database migrations..."\n\
bunx prisma db push\n\
echo "Starting application..."\n\
bun start' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["./start.sh"]