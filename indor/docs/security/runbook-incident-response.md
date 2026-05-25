# Runbook: Incident Response — INDOR

> For security incidents affecting the INDOR platform.

---

## Severity Levels

| Level | Definition | Example |
|-------|-----------|---------|
| P0 — Critical | Active breach, data exfiltration, service down | DB credentials leaked, active SQL injection |
| P1 — High | Vulnerability with exploit potential, partial data exposure | RBAC bypass found, secret in logs |
| P2 — Medium | Security weakness, no active exploit | Outdated dependency with known CVE |
| P3 — Low | Informational finding | Missing security header |

---

## Response Steps

### Step 1 — Detect & Triage (0–15 min)

- Identify source: CI alert, user report, monitoring alarm
- Assess severity (P0–P3)
- Assign incident commander (Ricardo Rivera or designated tech lead)
- Open incident channel: `#incident-YYYY-MM-DD` in Discord/Slack

### Step 2 — Contain (15–60 min)

**P0 actions:**
```bash
# Revoke all active JWT tokens (invalidate by rotating JWT_SECRET)
# This forces all users to re-login

# If DB credentials compromised:
# 1. Immediately rotate DB password (see secret-rotation runbook)
# 2. Audit recent DB queries in logs
# 3. Check for data exfiltration indicators

# If Stripe credentials compromised:
# 1. Go to Stripe Dashboard → Developers → API keys → Roll key
# 2. Update GitHub Secret: STRIPE_SECRET_KEY
# 3. Redeploy API

# Temporary: block suspicious IPs via rate limiter config or firewall
```

**P1 actions:**
- Disable affected endpoint or feature flag if available
- Rotate secrets relevant to the vulnerability
- Notify affected users if PII was exposed

### Step 3 — Investigate (1–4 hours)

- Pull AuditLog for affected time window:
  ```sql
  SELECT * FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
  ORDER BY created_at DESC;
  ```
- Review structured logs for anomalous patterns
- Identify: what data was accessed, by whom, from where
- Preserve evidence (don't delete logs)

### Step 4 — Remediate

- Deploy fix to staging, verify security gate passes
- Deploy to production via standard PR process
- Verify fix resolves the vulnerability
- Rotate any secrets that may have been exposed

### Step 5 — Communicate

**If user data was exposed:**
- Notify affected users within 72 hours (GDPR/CCPA baseline)
- Describe: what happened, what data, what we did, what users should do
- Email from: security@safeprojectsolutions.com

### Step 6 — Post-Mortem (within 72 hours of resolution)

Document in `indor/docs/security/incidents/YYYY-MM-DD-incident.md`:
- Timeline
- Root cause
- Impact
- Actions taken
- Prevention measures added
- Lessons learned

---

## Key Contacts

| Role | Responsibility |
|------|---------------|
| Ricardo Rivera | Incident Commander, owner notification |
| Tech Lead | Technical containment + remediation |
| Legal (when applicable) | User notification, regulatory compliance |

---

## Emergency Rotations

See [runbook-secret-rotation.md](./runbook-secret-rotation.md) for step-by-step secret rotation procedures.
