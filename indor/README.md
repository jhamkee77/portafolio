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
| API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api |
| Web | http://localhost:3000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Phase Plan

| Phase | PR | Status | Description |
|-------|----|--------|-------------|
| **0** | #1 | ✅ In Progress | Scaffolding + security foundation |
| **1** | #2 | ⏳ Pending | Backend + DB + order state machine |
| **2** | #3 | ⏳ Pending | Next.js web MVP + booking loop |
| **3** | #4 | ⏳ Pending | Admin + Provider portal |
| **4** | #5 | ⏳ Pending | Stripe payments + S3 + notifications |
| **5+** | — | ⏳ Future | House Facts, Realtor, Mobile, AI |

---

## Contributing

- See [SECURITY.md](./SECURITY.md) for security policy
- See [docs/CONTEXT_DIGEST.md](./docs/CONTEXT_DIGEST.md) for full product context
- All PRs require: CI green + security workflow green + no secrets + tests
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- No direct pushes to `main`
