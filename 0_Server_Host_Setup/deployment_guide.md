# APML Connect Pro - Deployment Guide & Production Optimizations

This document explains how to build, optimize, and deploy the APML Connect Pro SaaS platform in a containerized production environment.

---

## 1. Containerization (Docker)

APML Connect Pro runs in isolated Docker containers to guarantee parity between development and production systems.

- **Frontend:** Next.js application built in a multi-stage process to minimize image size (under 150MB).
- **Backend:** Node.js Express server running under a non-privileged user (`node`) to enhance runtime security.
- **Database & Cache:** PostgreSQL and Redis containers configured with persistent volumes.

To start the entire environment locally:
```bash
docker-compose up -d --build
```

---

## 2. Production Optimizations

### Database Tuning & Pooling
- **PgBouncer Connection Pooling:** In high-concurrency environments, PostgreSQL connections can become a bottleneck. APML Connect Pro backend routes database calls through PgBouncer. Connection URLs are formatted as:
  `postgresql://user:pass@pg-bouncer-host:6432/db?pgbouncer=true`
- **Prisma Connection Tuning:** Prisma is configured with a connection limit matching target hardware allocations:
  `DATABASE_URL="postgresql://...&connection_limit=20"`

### Next.js Performance Optimizations
- **Static vs. Dynamic Generation:** Public marketing pages and doctors' public profiles are generated statically using Next.js **Static Site Generation (SSG)** with **Incremental Static Regeneration (ISR)** every 10 minutes to maintain fast initial loads.
- **Client Bundle Size Reduction:** All dashboard modules are dynamically imported (`next/dynamic`) to split bundles.
- **Image Optimization:** Public profiles and hospital assets use the Next.js `<Image />` component, which automatically web-compresses and resizes images based on the client screen layout.

### Cache Strategy
- **Redis Sessions & API Caching:** Session state, token invalidation tables, and rate-limiting counters are offloaded to a Redis cluster.
- **Cache-Control Headers:** Static assets are served with long-term cache headers:
  `Cache-Control: public, max-age=31536000, immutable`

---

## 3. Production Deployment Platforms

### Vercel / Render / AWS ECS
1. **Frontend App:** Best deployed on **Vercel** for automatic global edge routing, ISR validation, and image optimizations.
2. **Backend Server:** Best deployed on **AWS ECS (Fargate)** or **Render** with autoscaling configured:
   - Scale up when CPU exceeds 70% or memory exceeds 80%.
   - Configure health check path at `/api/health`.
3. **Database:** Deploy on **AWS RDS PostgreSQL** (Multi-AZ) or **Supabase** with automated backups and encryption enabled.
4. **Caching:** Deploy on **AWS ElastiCache Redis**.
