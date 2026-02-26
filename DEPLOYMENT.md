# Deployment Guide — For DevOps Engineer

## Overview

This Next.js application now includes **authentication (login/register)** using **SQLite** via `better-sqlite3`. This document covers what's needed to deploy and maintain the database in production.

---

## Architecture

```
┌─────────────────────────────┐
│  Next.js App (Docker)       │
│  ├── Frontend (React)       │
│  ├── API Routes (/api/auth) │
│  └── SQLite DB (file-based) │
│      └── /data/app.db       │
└─────────────────────────────┘
```

- **Database**: SQLite via `better-sqlite3` (lightweight, zero-config, file-based)
- **Auth**: Custom token-based authentication (HMAC-signed tokens)
- **Password hashing**: PBKDF2 with SHA-512 (10,000 iterations)

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `./data/app.db` | Path to the SQLite database file |
| `AUTH_SECRET` | `next-demo-secret-change-in-production` | **MUST CHANGE** — Secret key for signing auth tokens |
| `NODE_ENV` | `development` | Set to `production` for deployment |

### ⚠️ IMPORTANT
- **Change `AUTH_SECRET`** in production! Use a random 64+ character string.
- Generate one with: `openssl rand -hex 32`

---

## Docker Deployment

### Updated Dockerfile

The existing Dockerfile needs one change — `better-sqlite3` is a **native module** that requires build tools:

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy native module
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bindings ./node_modules/bindings
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prebuild-install ./node_modules/prebuild-install
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### Key changes from previous Dockerfile:
1. Added `python3 make g++` to deps stage (needed to compile `better-sqlite3`)
2. Added `/app/data` directory creation with correct permissions
3. Added native module copying to runner stage

---

## Docker Run Command

```bash
docker run -d \
  --name next-app \
  -p 3000:3000 \
  -v /opt/deployments/oros-deployment/next-app-data:/app/data \
  -e AUTH_SECRET="$(openssl rand -hex 32)" \
  -e DATABASE_PATH="/app/data/app.db" \
  -e NODE_ENV=production \
  --restart unless-stopped \
  next-app:latest
```

### Volume Mount
- **`/opt/deployments/oros-deployment/next-app-data:/app/data`** — Persists the SQLite database across container restarts and rebuilds
- Create the host directory: `mkdir -p /opt/deployments/oros-deployment/next-app-data`
- Set permissions: `chown 1001:1001 /opt/deployments/oros-deployment/next-app-data`

---

## Database Management

### Backup
```bash
# Simple file copy (SQLite is a single file)
cp /opt/deployments/oros-deployment/next-app-data/app.db \
   /opt/deployments/oros-deployment/next-app-data/app.db.backup.$(date +%Y%m%d)
```

### Reset
```bash
# Remove the database file (will be recreated on next app start)
rm /opt/deployments/oros-deployment/next-app-data/app.db
docker restart next-app
```

### View Data (for debugging)
```bash
# Install sqlite3 on host
apt-get install sqlite3

# Query the database
sqlite3 /opt/deployments/oros-deployment/next-app-data/app.db "SELECT id, name, email, created_at FROM users;"
```

---

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## CI/CD Deploy Script Update

Update the deploy script (`deploy-next-app.sh`) to:

1. **Preserve the data volume** during redeployments
2. Pass environment variables
3. Rebuild the Docker image with the new deps stage

```bash
#!/bin/bash
cd /opt/deployments/oros-deployment/next-app
git pull origin main

# Rebuild image
docker build -t next-app:latest .

# Stop old container (preserves volume data)
docker stop next-app 2>/dev/null
docker rm next-app 2>/dev/null

# Start new container with persistent data volume
docker run -d \
  --name next-app \
  -p 3000:3000 \
  -v /opt/deployments/oros-deployment/next-app-data:/app/data \
  -e AUTH_SECRET="${AUTH_SECRET:-$(cat /opt/deployments/oros-deployment/.auth-secret)}" \
  -e DATABASE_PATH="/app/data/app.db" \
  -e NODE_ENV=production \
  --restart unless-stopped \
  next-app:latest
```

---

## Scaling Notes

SQLite is great for this use case (single-server, moderate traffic). If the app needs to scale to multiple instances or handle >1000 concurrent writes/sec, consider migrating to PostgreSQL. The `lib/db.ts` module is designed to make this migration straightforward.

---

## Checklist for DevOps

- [ ] Update Dockerfile with native module build support
- [ ] Create persistent data directory on host
- [ ] Generate and store AUTH_SECRET securely
- [ ] Update deploy script to mount data volume
- [ ] Set up daily database backup cron job
- [ ] Update nginx config if needed (no changes expected)
- [ ] Test login/register flow after deployment
