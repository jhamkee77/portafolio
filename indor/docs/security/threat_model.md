# INDOR — Threat Model (STRIDE-Lite)
> Last updated: 2026-05-25 | Phase 0

---

## Assets

| Asset | Sensitivity | Description |
|-------|------------|-------------|
| User PII | Critical | Email, phone, name, address |
| Property Data | High | Address, systems, valuation history |
| Payment Data | Critical | Stripe tokens (we never store raw card data) |
| Provider Credentials | High | Login, verification documents |
| JWT Tokens | Critical | Access + refresh tokens |
| AuditLogs | High | Privileged action history |
| S3 Documents | High | Property photos, inspection reports |
| Synchrony Credentials | Critical | Financial API credentials (server-side only) |

---

## Threat Actors

| Actor | Motivation | Capability |
|-------|-----------|-----------|
| External Attacker | Financial gain, data theft | Medium |
| Malicious Provider | Bypass RBAC, access other orders | Low-Medium |
| Compromised Admin | Insider threat, data exfiltration | High |
| Script Kiddie | Automated scanning, DoS | Low |

---

## STRIDE Analysis

### S — Spoofing Identity

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| JWT token theft via XSS | All authenticated users | High | HTTPOnly cookies, short expiry (15 min), CSP headers |
| OAuth token interception | Google/Apple login | Medium | HTTPS only, state parameter validation |
| Provider impersonation | Order status updates | High | Server-side RBAC guards, provider-order binding |
| Admin credential compromise | Full system access | Critical | MFA (Phase 2), audit logs, session invalidation |

### T — Tampering

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| Order status manipulation | Order lifecycle | Critical | State machine enforces valid transitions, RBAC per transition |
| Property record falsification | House Facts | High | AuditLog on every write, admin review required |
| Payment amount manipulation | Stripe charges | Critical | Amount computed server-side, never trust client |
| File upload replacement | S3 documents | Medium | Signed upload URLs, content-type validation |

### R — Repudiation

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| Provider denies completing work | Order completion | Medium | Before/after photos required, timestamped AuditLog |
| Admin denies action | Privileged operations | High | Immutable AuditLog with IP + user_id |
| Payment dispute | Transactions | High | Stripe webhook logs + Payment entity audit trail |

### I — Information Disclosure

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| API returns other users' data | User/property data | Critical | Ownership checks on every query, row-level guards |
| Logs contain PII/tokens | Log aggregation | High | Structured logging with PII scrubbing |
| S3 documents publicly accessible | Property documents | High | Signed URLs only, no public bucket policy |
| Error messages leak stack traces | API consumers | Medium | Generic error responses in production, detailed logs server-side only |
| Synchrony credentials in client | Financial API | Critical | Server-to-server only, never in frontend |

### D — Denial of Service

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| Brute force login | Auth endpoints | High | Rate limiting (5 attempts/min), account lockout |
| File upload flood | S3 + API | Medium | File size limits (50MB), upload rate limiting |
| WebSocket connection flood | Socket.io | Medium | Connection limits per IP, authenticated connections only |
| Heavy DB queries | PostgreSQL | Medium | Query timeouts, pagination enforced, indexes on FK |

### E — Elevation of Privilege

| Threat | Target | Risk | Mitigation |
|--------|--------|------|-----------|
| Homeowner accessing admin endpoints | Admin panel | Critical | Role guard on every admin route, never trust client-sent role |
| Provider accessing other providers' orders | Order data | High | Provider-order ownership binding, server-side check |
| Mass assignment via DTO | User role escalation | Critical | class-validator whitelist mode, explicit DTO fields only |
| JWT role claim manipulation | RBAC bypass | Critical | Role read from DB, not from JWT payload |

---

## Risk Matrix

| Threat | Likelihood | Impact | Risk | Status |
|--------|-----------|--------|------|--------|
| JWT theft / XSS | Medium | Critical | High | Mitigated (HTTPOnly, CSP) |
| Order status manipulation | Low | Critical | High | Mitigated (state machine + RBAC) |
| Cross-user data leak | Medium | Critical | High | Mitigated (ownership guards) |
| Admin credential compromise | Low | Critical | High | Partial (MFA Phase 2) |
| S3 document exposure | Low | High | Medium | Mitigated (signed URLs) |
| DoS on auth endpoints | High | Medium | Medium | Mitigated (rate limiting) |
| Payment amount manipulation | Low | Critical | Medium | Mitigated (server-side amount) |
| Log PII leakage | Medium | High | Medium | Mitigated (scrubbing) |

---

## Residual Risks & Phase 2 Actions

- [ ] MFA for admin accounts
- [ ] Penetration testing before public launch
- [ ] SBOM (CycloneDX) generation
- [ ] Container scanning (Trivy) when Dockerized
- [ ] Web Application Firewall (WAF) in production
- [ ] Synchrony sandbox validation before enabling financing flow
