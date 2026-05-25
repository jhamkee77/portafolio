# Security Policy — INDOR

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately to:
- **Email:** security@safeprojectsolutions.com
- **Subject:** `[INDOR SECURITY] Brief description`

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Response SLA
| Severity | Acknowledgement | Resolution Target |
|----------|----------------|-------------------|
| Critical | 24 hours | 72 hours |
| High | 48 hours | 7 days |
| Medium | 5 days | 30 days |
| Low | 10 days | 90 days |

---

## Scope

### In Scope
- INDOR API (`indor/services/api/`)
- INDOR Web App (`indor/apps/web/`)
- Authentication flows (JWT, OAuth)
- Payment flows (Stripe integration)
- Data exposure / PII leaks
- RBAC bypass
- Injection attacks (SQL, XSS, command injection)

### Out of Scope
- Third-party services (Stripe, Google Maps, Synchrony)
- Social engineering
- Denial of service attacks
- Attacks requiring physical access

---

## Security Measures

### Authentication & Authorization
- JWT access tokens (15-min expiry) + refresh tokens (7-day expiry, rotation on use)
- OAuth 2.0 for Google/Apple Sign-In
- Strict RBAC enforced server-side (never trust client role claims)
- All sensitive routes require valid JWT + role guard

### Data Protection
- HTTPS/TLS in transit (enforced in production)
- AES-256 for sensitive data at rest
- Stripe processes all payment data (PCI DSS compliant — we never store card data)
- Synchrony API: server-to-server only (credentials never exposed to client)
- S3 signed URLs with expiry (no public direct URLs for documents)

### Application Security
- All inputs validated via class-validator DTOs
- Helmet.js for HTTP security headers
- Strict CORS (explicit origin allowlist)
- Rate limiting: 100 req/min per IP, 1000 req/min per authenticated user
- Request size limits: 10MB default, 50MB for file uploads
- No sensitive data in logs (no tokens, card data, passwords, unnecessary PII)

### Audit Trail
- Every privileged action (admin/provider) creates an immutable AuditLog entry
- AuditLog includes: user_id, action, entity_type, entity_id, IP, timestamp, metadata

### CI Security Gates
- CodeQL (SAST) on every PR
- gitleaks (secret scanning) on every commit
- Dependabot + npm audit (dependency vulnerabilities)
- PRs blocked if any gate fails

---

## Incident Response

See [docs/security/runbook-incident-response.md](./docs/security/runbook-incident-response.md)

## Secret Rotation

See [docs/security/runbook-secret-rotation.md](./docs/security/runbook-secret-rotation.md)
