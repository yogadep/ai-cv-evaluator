# ---- Base image ----
    FROM node:20-alpine AS base
    WORKDIR /app
    
    # Install deps only from lockfiles
    COPY package*.json ./
    # gunakan npm ci agar konsisten; kalau tanpa package-lock.json, fallback ke install
    RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
    
    # Copy source
    COPY src ./src
    COPY ingestion ./ingestion
    # Dokumen ground-truth (optional; kalau di-mount saat runtime juga boleh)
    
    # Pastikan folder upload tersedia saat runtime
    RUN mkdir -p /app/storage/uploads
    
    # Non-root user
    RUN adduser -D -u 10001 app && chown -R app:app /app
    USER app
    
    ENV NODE_ENV=production \
        PORT=8000
    
    # Uploads disimpan sebagai volume agar persist di container
    VOLUME ["/app/storage"]
    
    # API port
    EXPOSE 8000
    
    # Default jalankan API; untuk worker override CMD di docker-compose
    CMD ["node", "src/server.js"]
    