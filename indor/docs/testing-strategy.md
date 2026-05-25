# INDOR — Testing Strategy

---

## Testing Layers

| Layer | Tool | Scope | When |
|-------|------|-------|------|
| Unit | Jest | Services, state machine, utilities | Phase 1+ |
| Integration | Jest + Supertest | API endpoints, DB flows | Phase 1+ |
| E2E | Playwright | Full user flows in browser | Phase 2+ |
| Security | CI gates (CodeQL, gitleaks) | Every PR | Phase 0+ |

**Coverage threshold:** 80% branches, functions, lines (backend)

---

## Phase Coverage Map

### Phase 0 — Infrastructure only
- No application code yet
- CI test gates configured (run on no-test pass until Phase 1 code exists)

### Phase 1 — Backend
Critical test targets:
- Order lifecycle state machine (all 10 transitions + invalid transitions)
- RBAC guards (per role × per endpoint)
- Auth flows (signup, login, token refresh, token revocation)
- AuditLog creation on privileged actions
- Property ownership guard (user can only access own properties)

### Phase 2 — Frontend + E2E
Playwright e2e flow (non-negotiable):
```
signup → add property → book service → order created →
status updated → completed → saved to property record
```

### Phase 3 — Admin + Provider
- Admin: assign provider, update status, view property record
- Provider: update order status, upload before/after photos
- AuditLog verification for every admin/provider action

### Phase 4 — Payments
- Stripe webhook processing (payment_intent.succeeded, payment_intent.payment_failed)
- Payment status sync with Order status
- S3 upload flow (signed URL generation + upload verification)

---

## RBAC Test Matrix

For every protected endpoint, test all 6 roles:

| Role | Auth endpoints | Homeowner endpoints | Admin endpoints | Provider endpoints |
|------|---------------|--------------------|-----------------|--------------------|
| homeowner | ✅ own data only | ✅ | ❌ 403 | ❌ 403 |
| renter | ✅ own data only | ✅ limited | ❌ 403 | ❌ 403 |
| realtor | ✅ own data only | ✅ read-only | ❌ 403 | ❌ 403 |
| property_manager | ✅ own data only | ✅ | ❌ 403 | ❌ 403 |
| provider | ✅ own data only | ❌ 403 | ❌ 403 | ✅ assigned orders |
| admin | ✅ | ✅ all | ✅ | ✅ all |

---

## Order Lifecycle Test Matrix

Test every valid transition AND every invalid transition:

| From → To | Valid | Actor | Test |
|-----------|-------|-------|------|
| Requested → Confirmed | ✅ | admin | ✔ |
| Confirmed → ProviderAssigned | ✅ | admin | ✔ |
| ProviderAssigned → OnTheWay | ✅ | provider | ✔ |
| OnTheWay → Arrived | ✅ | provider | ✔ |
| Arrived → WorkInProgress | ✅ | provider | ✔ |
| WorkInProgress → EstimateSent | ✅ | provider | ✔ |
| EstimateSent → Completed | ✅ | provider + homeowner confirm | ✔ |
| Completed → Reviewed | ✅ | homeowner | ✔ |
| Reviewed → SavedToPropertyRecord | ✅ | system/admin | ✔ |
| Requested → WorkInProgress (skip) | ❌ | any | ✔ (expect 422) |
| SavedToPropertyRecord → any | ❌ | any | ✔ (expect 422) |

---

## Definition of Done — Per PR

A PR is mergeable only if:
- [ ] CI workflow green (lint + build + tests)
- [ ] Security workflow green (CodeQL + gitleaks + npm audit)
- [ ] No secrets detected in diff
- [ ] Tests added for all new critical flows
- [ ] Coverage did not decrease below 80%
- [ ] API docs updated if endpoints changed
- [ ] Changes limited to the requested phase scope
