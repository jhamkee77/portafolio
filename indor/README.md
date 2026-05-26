# INDOR — Home Services Marketplace + Home Operating System

> Property-based marketplace that feels like DoorDash for services, Uber for tracking, and Carfax for property history.

**Company:** Safe Project Solutions | **Founder:** Ricardo Rivera | **Market:** Charlotte, NC

---

## What Is INDOR?

INDOR transforms residential properties into managed digital assets. Every service order connects:

```
user → property → service → provider → payment → permanent property record
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js 20 + NestJS |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Cache / Queue | Redis + BullMQ |
| Real-time | Socket.io |
| Frontend | Next.js (App Router) + TypeScript |
| Testing | Jest + Supertest + Playwright |
| CI/CD | GitHub Actions |
| Storage | AWS S3 (MinIO local fallback) |

---

## Project Structure

```
indor/
├── services/
│   └── api/          # NestJS backend
├── apps/
│   └── web/          # Next.js frontend
├── infra/            # Infrastructure configs
├── docs/             # Documentation & ADRs
│   ├── security/     # Threat model, runbooks
│   ├── CONTEXT_DIGEST.md
│   ├── REPO_ASSESSMENT.md
│   └── frontend-architecture.md
├── docker-compose.yml
└── .env.example
```

---

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Copy env file and fill in values
cp indor/.env.example indor/.env

# 2. Start infrastructure
cd indor && docker compose up -d

# 3. Install API dependencies
cd services/api && npm install

# 4. Run migrations
npx prisma migrate dev

# 5. Start API
npm run start:dev

# 6. Install web dependencies
cd ../../apps/web && npm install

# 7. Start web
npm run dev
```

### Services
| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:3000/api |
| Web | http://localhost:3001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| MinIO Console | http://localhost:9001 |

---

## Deployment

### Option 1 — Docker Compose (single host / VPS)

Builds API + Web images and runs the full stack with managed Postgres / Redis / MinIO.

```bash
cd indor
cp .env.example .env   # fill in JWT_SECRET, JWT_REFRESH_SECRET, etc.
docker compose --profile app up --build -d
```

| Service | Port |
|--------|------|
| Web (Next.js) | 3001 → container :3000 |
| API (NestJS) | 3000 |
| Postgres | 5432 |
| Redis | 6379 |
| MinIO (S3) | 9000 / console 9001 |

Migrations run automatically on container start (`prisma migrate deploy`).

### Option 2 — Vercel (Web) + Railway / Render (API + DB)

**Frontend → Vercel**

1. Connect the repo, point the Project root to `indor/apps/web`.
2. Vercel auto-detects Next.js (`vercel.json` confirms framework + region).
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

**Backend → Railway** (via Dockerfile)

1. New service → Deploy from GitHub → root directory `indor/services/api`.
2. Railway reads [`railway.json`](services/api/railway.json) and builds from the Dockerfile.
3. Attach a Postgres plugin → wire `DATABASE_URL`. Attach Redis → `REDIS_URL`.
4. Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (= Vercel URL), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, AWS S3 keys.
5. The container's start command runs migrations then `node dist/main.js`.

**Backend → Render** (alternative, via [`infra/render.yaml`](infra/render.yaml))

```bash
# In Render dashboard:
# New + → Blueprint → point at this repo → select indor/infra/render.yaml
```

### Required environment variables (production)

| Variable | Where |
|----------|-------|
| `DATABASE_URL` | API (Postgres connection) |
| `REDIS_URL` | API (queue) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | API (64-char random hex) |
| `CORS_ORIGIN` | API (Vercel URL of web) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | API (Stripe dashboard) |
| `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | API (or leave AWS_S3_ENDPOINT blank to hit real S3) |
| `NEXT_PUBLIC_API_URL` | Web |
| `NEXT_PUBLIC_SOCKET_URL` | Web |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web |

### CI / CD

`.github/workflows/ci.yml` runs on every push and PR:
- API: install → prisma generate → build → migrate → unit tests (79 tests)
- Web: install → typecheck → build
- Docker: image build (API + Web) — PR-only, cached with GHA cache

`.github/workflows/security.yml` runs CodeQL (SAST), gitleaks (secret scan) and `npm audit` weekly + on every PR.

---

## Phase Plan

| Phase | PR | Status | Description |
|-------|----|--------|-------------|
| **0 + 1** | [#10](https://github.com/jhamkee77/portafolio/pull/10) | ✅ Merged | Scaffolding + NestJS API + 11 modules |
| **2** | [#11](https://github.com/jhamkee77/portafolio/pull/11) | ✅ Merged | Next.js frontend (19 routes) |
| **3** | [#12](https://github.com/jhamkee77/portafolio/pull/12) | ✅ Merged | Integration + Supabase + E2E tests |
| **4** | [#13](https://github.com/jhamkee77/portafolio/pull/13) | ✅ Merged | Stripe payments + S3 documents + notifications |
| **5** | #14 | 🚀 This PR | Docker images + Vercel/Railway/Render configs + CI hardening |
| **6+** | — | 🔮 Future | House Facts, Realtor, Mobile, AI features |

---

## Contributing

- See [SECURITY.md](./SECURITY.md) for security policy
- See [docs/CONTEXT_DIGEST.md](./docs/CONTEXT_DIGEST.md) for full product context
- All PRs require: CI green + security workflow green + no secrets + tests
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- No direct pushes to `main`
