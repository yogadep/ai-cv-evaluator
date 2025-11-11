# ---- Base image ----
    FROM node:20-alpine AS base
    WORKDIR /app
    
    # Install dependencies from lockfiles
    COPY package*.json ./
    # Use npm ci when lockfile exists; otherwise fall back to npm install
    RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
    
    # Copy source code
    COPY src ./src
    COPY ingestion ./ingestion
    # Ground-truth documents (optional; can also be mounted at runtime)
    
    # Ensure upload folder exists at runtime
    RUN mkdir -p /app/storage/uploads
    
    # Non-root user
    RUN adduser -D -u 10001 app && chown -R app:app /app
    USER app
    
    ENV NODE_ENV=production \
        PORT=8000
    
    # Persist uploads as a volume
    VOLUME ["/app/storage"]
    
    # API port
    EXPOSE 8000
    
    # Default: run API; worker overrides CMD via docker-compose
    CMD ["node", "src/server.js"]
    
