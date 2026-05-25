# INDOR — Context Digest
> Token-efficient reference. Read this instead of re-reading all source docs every session.
> Last updated: 2026-05-25 | Based on: INDOR_ClaudeCode_MasterPrompt_FINAL.md + 3 context docs

---

## 1. What INDOR Is

**Home INDOR** is a **property-based home services marketplace + home operating system**.

Feels like:
- **DoorDash** — marketplace UX for selecting services
- **Uber** — real-time provider/order tracking
- **Carfax** — permanent technical history of the property (House Facts Record)

**Core law:** Every order connects → `user + property + service + provider + payment + property record`

**Company:** Safe Project Solutions | **Founder:** Ricardo Rivera | **Market:** Charlotte, NC

**Strategic insight:** INDOR is not just a marketplace. It is a **decision-support infrastructure for real estate transactions** — the system that prevents deals from falling through due to technical issues.

---

## 2. MVP Scope

### Included (Phase 0–4)
- Homeowner flow end-to-end: onboarding → add property → marketplace → booking → order tracking → completion → property record update
- 20 MVP screens (see Section 6)
- Admin: manual operation of marketplace (assign provider, update status)
- Provider: minimal portal/secure link for status updates + before/after uploads
- Auth: email/password + Google + Apple Sign-In
- Payments: Stripe test mode
- Storage: S3 signed URLs (local fallback for dev)
- Notifications: email/SMS/push stubs

### Excluded from MVP (Phase 2+)
| Feature | Phase |
|---------|-------|
| Contractor full onboarding (manual at start) | 2 |
| Admin panel complete | 2 |
| Review system advanced | 2 |
| Membership plans ($59/$89/$149) | 2 |
| House Facts Record (live Carfax) | 2 |
| Transfer Package | 2 |
| Smart Upsell (auto escalation) | 2 |
| Warranty intelligence | 2 |
| Inspection parsing | 3 |
| Property Transfer Digital | 3 |
| AI layer / predictive maintenance | 5+ |

### Financing (Synchrony) — Deferred
Build `FinancingAdapter` interface + stub implementation only. Do **not** implement full Synchrony flow until owner provides sandbox credentials.

---

## 3. User Roles

| Role | MVP Priority | Description |
|------|-------------|-------------|
| `homeowner` | ✅ Primary | Books services, manages property |
| `admin` | ✅ Required | Safe Project Solutions ops team |
| `provider` | ✅ Minimal | Status updates + before/after uploads |
| `renter` | Phase 2 | Like homeowner, limited |
| `realtor` | Phase 2+ | Transaction support dashboard |
| `property_manager` | Phase 2+ | Portfolio management |

---

## 4. Order Lifecycle — Exact 10 States

```
Requested → Confirmed → ProviderAssigned → OnTheWay → Arrived →
WorkInProgress → EstimateSent → Completed → Reviewed → SavedToPropertyRecord
```

Every state transition must:
1. Be authorized by role (RBAC)
2. Create an AuditLog entry
3. Emit a WebSocket event (real-time tracking)
4. Optionally trigger a notification

---

## 5. Core Data Entities

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `User` | id, email, name, phone, role, auth_provider | roles: homeowner, renter, realtor, property_manager, provider, admin |
| `Property` | id, user_id, address, beds, baths, sqft, year_built, home_value, maintenance_score | **Anchor of the system** — persists across owner changes |
| `HomeSystem` | id, property_id, type, brand, model, serial, warranty_status | HVAC, water heater, roof, electrical, plumbing, appliances |
| `Service` | id, name, category, base_price, price_range, duration, rating, questions, add_ons | Marketplace catalog |
| `Order` | id, user_id, property_id, service_id, provider_id, payment_id, status, booking_date | Central join table |
| `Provider` | id, type, services, availability, rating, status, verified | Can be contractor |
| `Payment` | id, user_id, order_id, amount, method, status, stripe_intent_id | Stripe test mode MVP |
| `Document` | id, property_id, order_id, system_id, type, file_url, signed_url_expiry | S3 signed URLs |
| `Message` | id, order_id, sender_id, content, type | Optional MVP |
| `AuditLog` | id, user_id, action, entity_type, entity_id, metadata, ip, created_at | **REQUIRED — never skip** |

---

## 6. MVP Screens (20)

1. Splash / Welcome
2. Sign Up / Login
3. Add Property
4. Property Data Imported
5. Home Dashboard
6. Service Marketplace
7. Service Detail
8. Customize Service
9. Schedule
10. Confirm Booking
11. Payment Options
12. Financing Plans (Synchrony stub)
13. Pre-Approval (stub)
14. Order Confirmed
15. Live Tracking
16. Service In Progress
17. Service Completed + Rating
18. Payment Dashboard
19. Profile / Account
20. Notifications

---

## 7. Integrations

| Integration | Purpose | MVP Status |
|------------|---------|-----------|
| **Stripe** | Payment processing | ✅ Test mode |
| **Google Maps Platform** | Geocoding, maps, live tracking | ✅ Required |
| **Firebase Auth** (or JWT) | email/Google/Apple Sign-In | ✅ Required |
| **Firebase Cloud Messaging** | Push notifications | Stub OK |
| **AWS S3** | Photo/document storage | ✅ Local fallback for dev |
| **Twilio** | SMS verification | Stub OK |
| **SendGrid** | Transactional email | Stub OK |
| **Synchrony Financial** | Monthly financing (Pay Monthly) | ⏸ FinancingAdapter stub only |
| **Property Data APIs** | Auto-populate property data | Phase 2 |

---

## 8. Monetization (Business Context)

| Source | Rate | Notes |
|--------|------|-------|
| Service Fee | 8–15% | Per transaction on each booked service |
| Financing Fee | 1–3% | Per Synchrony-facilitated loan |
| Subscriptions | $59/$89/$149/mo | Essentials/Plus/Premium — Phase 2 |
| Interest Income | Variable | From financial partners |

**Ticket range:** $1k–$2k (low) / $3k–$5k (mid) / $10k–$25k+ (high)

---

## 9. Technical Stack

### Backend — `indor/services/api/`
- Node.js 20 + **NestJS** (modular architecture)
- **Prisma** ORM
- **PostgreSQL 15** (+ PostGIS if/when geospatial needed)
- **Redis** + BullMQ (cache + queues)
- **Socket.io** (WebSockets for real-time order tracking)
- **Swagger/OpenAPI** (required from Phase 1)

> Note: MANUAL doc mentions .NET/C#/hexagonal — **master prompt overrides**: use Node.js + NestJS.

### Frontend — `indor/apps/web/`
- **Next.js** (App Router) + TypeScript
- Socket.io client (real-time tracking)
- Zustand (global state where needed)

### Infrastructure
- Docker Compose (local dev: PostgreSQL + Redis + API + Web)
- GitHub Actions (CI/CD)
- S3 / MinIO (local fallback)

### Testing
- Jest + Supertest (backend unit + integration)
- Playwright (e2e)
- Coverage threshold: 80%

---

## 10. Security Requirements (Non-Negotiable)

- DTO/schema validation on all inputs (class-validator)
- Strict **RBAC** server-side (NestJS Guards)
- Rate limiting (per IP + per user)
- Helmet + secure headers
- Strict CORS
- Request size limits
- JWT with refresh tokens (no sensitive data in payload)
- S3 signed URLs with expiry (no public direct URLs)
- Stripe PCI DSS compliant (never log card data)
- Synchrony API server-to-server only (never expose to client)
- **AuditLog required** for all admin/provider privileged actions
- No tokens, payment data, or unnecessary PII in logs

### CI Security Gates
- CodeQL (SAST) — TypeScript/JavaScript
- gitleaks (secret scanning)
- Dependabot + npm audit (dependency scanning)
- Fail on high/critical vulnerabilities

---

## 11. Engineering Principles

1. Monolith-first, modular by domain (no premature microservices)
2. Strong domain module boundaries
3. Secure-by-default
4. Clear API contracts (OpenAPI)
5. Observability from day 1 (structured JSON logs, request IDs on every request)
6. CI security gates must block unsafe merges
7. Every privileged action creates an AuditLog

---

## 12. Phase Plan Summary

| Phase | PR | Deliverable |
|-------|----|------------|
| **0** | #1 | Repo scaffolding + security foundation + this digest |
| **1** | #2 | NestJS API + Prisma + all core modules + order state machine |
| **2** | #3 | Next.js web MVP + full booking loop + Playwright e2e |
| **3** | #4 | Admin UI + Provider portal + AuditLog |
| **4** | #5 | Stripe payments + S3 uploads + notification adapters |
| **5+** | — | House Facts Intelligence, Realtor, Mobile (React Native), Memberships |

### Definition of Done (every PR)
- [ ] CI green
- [ ] Security workflow green
- [ ] No secrets committed
- [ ] Docs updated (README + OpenAPI if API changed)
- [ ] Tests added/updated for critical flows
- [ ] Changes limited to requested phase

---

## 13. Repository Rules

- **Repo:** `https://github.com/jhamkee77/portafolio.git`
- **INDOR lives in:** `/indor/` — do not touch files outside this folder without owner approval
- No direct pushes to `main` — always feature branches + PRs
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- Small PRs = one phase = one PR
- ADRs for major architectural decisions

---

## 14. Strategic Moat (Business Intelligence)

> "The app is not the business. Distribution + trust is the business."

The **dataset** is the real competitive advantage:
- Knowledge base of common home problems (HVAC, water heater, moisture, structure)
- Per problem: description, impact, urgency, standard solution, price range
- Real conversations and closed cases
- Decision logic: when to proceed, negotiate, or walk away

This dataset enables an AI layer (Phase 5+) that acts as a replicable "brain" for any city.
