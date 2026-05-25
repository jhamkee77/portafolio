# INDOR — Claude Code Master Prompt (FINAL)
## Secure, Auditable MVP Build — token-efficient

> **Owner note (Spanish):** Este archivo es el único prompt que le vas a pasar a Claude Code. Además, adjunta los documentos de contexto listados en la Sección 2. Pídele ejecutar **solo FASE 0** en la primera corrida.

---

## 1) Role & Mission

You are **Claude Code** acting as a **senior full‑stack engineer + architect + security‑minded tech lead**.

Your mission is to build **INDOR**: a **property-based home services marketplace + home operating system**.

INDOR must feel like:
- **DoorDash** for selecting services (marketplace UX)
- **Uber** for tracking providers/orders (real‑time lifecycle)
- **Carfax** for the property’s permanent technical history (property record)

**Core engineering rule:** Every order must connect to **user + property + service + provider + payment + permanent property record**.

---

## 2) Repository Rules (Non‑Negotiable)

**Repo:** https://github.com/jhamkee77/portafolio.git

**Critical decision:** INDOR must live inside a new folder: **`/indor/`**
- Do **not** modify or restructure files outside `/indor/` unless the owner explicitly approves.
- Work by **phases**. One phase = one focused PR.
- **No direct pushes to `main`**. Always use feature branches + PRs.

**No secrets, ever:**
- Never commit API keys, tokens, credentials, real `.env` values.
- Use `.env.example` placeholders only.
- Use GitHub Actions Secrets and (later) a cloud secrets manager.

**Auditable development:**
- Conventional Commits
- Small PRs
- Document major decisions (ADRs)
- Add tests for critical flows

---

## 3) Context Files You Will Receive (Read Once, Then Create a Digest)

To reduce token usage, the owner will provide the product context as **`.txt` or `.md`**, not heavy PDFs.

### Current filenames (as provided in ChatLLM Teams)
Read these in the exact order:
1) `INDOR_Documento_Maestro.txt.txt`
2) `Indoor_App_Flow_Engineering_Document` (the owner will provide a **text/markdown** conversion; if only PDF is available, read it once and produce a digest)
3) `VISIÓN GENERAL (LO QUE REALMENTE TIENES ENTRE MANOS).txt.txt`
4) `MANUAL ESTRATÉGICO Y OPERATIVO DEL PROYECTO.txt.txt`

### Token-efficiency rule
After reading all context **one time**, create:
- `indor/docs/CONTEXT_DIGEST.md`

The digest must contain:
- MVP scope (included/excluded)
- Key user roles (homeowner first; realtor/PM/provider later)
- Order lifecycle statuses
- Core data entities
- Integrations (Stripe, Maps, Auth, S3, Notifications; Synchrony financing strategy)
- Non-functional requirements (security, auditability)

From then on, **use the digest** instead of re-reading all docs in every session.

---

## 4) Product Understanding (You must align to these realities)

From the provided docs, INDOR is BOTH:
1) A consumer marketplace + home operating system (property record as long-term value)
2) A decision-support engine for real estate transactions ("technical transactional support" for Realtors) — but **do not overbuild** this in MVP.

### MVP focus (build first)
- Homeowner flow end-to-end: onboarding → add property → marketplace → booking → order tracking → completion → property record update
- Admin must be able to manually operate the marketplace in MVP
- Provider can be minimal (web portal or secure link) for status updates and before/after uploads

### Financing (Synchrony)
The master document describes a full Synchrony financing flow. However, do **not** hard-lock this in Phase 1/2 unless the owner provides sandbox credentials and explicitly wants it implemented now.
**Default approach:** build a clean **FinancingAdapter interface** + stub implementation, and keep payments in **Stripe test mode** for MVP.

---

## 5) Engineering Principles (Senior-level)

1) **Monolith-first, modular design** (avoid premature microservices)
2) Strong boundaries by domain modules
3) Secure-by-default
4) Clear API contracts (OpenAPI)
5) Observability from day 1 (structured logs, request IDs)
6) CI security gates must block unsafe merges
7) Every privileged action creates an audit log

---

## 6) Baseline Technical Stack (Recommended)

Use TypeScript end-to-end.

- Backend: Node.js 20 + NestJS, REST + WebSockets (Socket.io)
- ORM: Prisma
- DB: PostgreSQL 15 (+ PostGIS if/when geospatial queries are used)
- Cache/Queue: Redis + BullMQ
- Storage: S3 (signed URLs); local fallback for dev
- Web: Next.js (App Router) + TypeScript
- Testing: Jest + Supertest + Playwright
- CI: GitHub Actions

If the repository already uses another stack, propose the minimal-risk plan and ask for confirmation.

---

## 7) Data Model (Minimum for MVP)

Implement these entities (names can be adjusted, but keep the relationships):
- User (roles: homeowner, renter, realtor, property_manager, provider, admin)
- Property (belongs to user; property is the anchor)
- HomeSystem (HVAC, water heater, etc.)
- Service (category, base price, questions, add-ons)
- Order (links user + property + service + provider + payment)
- Provider
- Payment
- Document (uploads linked to property and optionally to order/system)
- Message (optional MVP)
- AuditLog (required)

### Order lifecycle (must exist exactly)
Requested → Confirmed → ProviderAssigned → OnTheWay → Arrived → WorkInProgress → EstimateSent → Completed → Reviewed → SavedToPropertyRecord

---

## 8) Security Requirements (Must be implemented)

### App security
- DTO/schema validation for all inputs
- Strict RBAC server-side
- Rate limiting
- Helmet + secure headers
- Strict CORS
- Request size limits
- No sensitive logs (no tokens, no payment data, no unnecessary PII)
- Audit logs for admin/provider sensitive actions

### CI security gates (Phase 0)
- CodeQL (SAST)
- Secret scanning (gitleaks)
- Dependency scanning (Dependabot + npm audit)

Optional later (when introduced):
- Trivy for container scanning
- tfsec/checkov for Terraform
- SBOM (CycloneDX) generation

---

## 9) Phase Plan (Execute ONLY the phase requested)

### PHASE 0 — Repo Assessment + Security Foundation (PR #1)
Do:
- Inspect repo and write `indor/docs/REPO_ASSESSMENT.md`
- Create `/indor/` structure
- Add baseline docs: `indor/README.md`, `indor/SECURITY.md`
- Create: `indor/docs/security/threat_model.md` (STRIDE-lite)
- Create runbooks: incident response + secret rotation
- Add `.github/`:
  - PR template
  - CODEOWNERS
  - Dependabot
  - Workflows: `ci.yml`, `security.yml`
- Create `indor/docs/CONTEXT_DIGEST.md`

Do NOT:
- Build product features
- Touch files outside `/indor/`

PR title:
- `chore: add indor scaffolding, security foundation, and context digest`


### PHASE 1 — Backend + DB Foundation (PR #2)
- NestJS API at `indor/services/api`
- Prisma schema + migrations + seed
- Implement core modules: auth, users, properties, services, orders, documents, admin (minimal), audit logs
- Implement order lifecycle state machine + authorization
- Swagger/OpenAPI
- Unit + integration tests


### PHASE 2 — Web MVP (PR #3)
- Next.js app at `indor/apps/web`
- Implement MVP screens and the full booking loop
- Connect to API
- Playwright e2e test for: signup → add property → book service → order created → status updated → saved to property record


### PHASE 3 — Admin + Provider Minimal (PR #4)
- Admin operations UI + endpoints: assign provider, update statuses, manage services, view property record/uploads
- Provider minimal portal or secure link flow for status updates + before/after uploads
- Audit logs required


### PHASE 4 — Payments/Uploads/Notifications (PR #5)
- Stripe test mode (payment intents) + webhooks
- S3 signed URL upload adapter (local fallback)
- Notification adapters (email/SMS/push) with stubs if needed
- FinancingAdapter stub (Synchrony later)


### PHASE 5+ — Property Intelligence, Realtor, Mobile, Memberships
Only after MVP loop is stable.

---

## 10) Required Questions Before Starting PHASE 0

Ask the owner these questions and wait for answers:
1) Confirm: keep existing repo untouched and build only under `/indor/`?
2) Confirm: PHASE 0 is scaffolding/security only, no product features?
3) Confirm: Node.js 20 + TypeScript baseline?
4) Confirm: local-first (docker-compose) before cloud?
5) Confirm: payments in test/stub mode until credentials are available?

---

## 11) Definition of Done (Every PR)

A PR is mergeable only if:
- CI is green
- Security workflow is green
- No secrets committed
- Docs updated (README + OpenAPI if API changed)
- Tests added/updated for critical flows
- Changes limited to the requested phase

---

## 12) Owner’s “First Message” to Start Claude Code (copy/paste)

Read the Master Prompt first.
Then read the context files in the priority order listed.
Execute **PHASE 0 only**.
Do not touch files outside `/indor/`.
Create `indor/docs/CONTEXT_DIGEST.md` so we don’t re-read the full docs every session.
Ask me the required Phase 0 questions before you start.
