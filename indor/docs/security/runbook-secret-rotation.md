# Runbook: Secret Rotation — INDOR

> How to rotate credentials without downtime. Run this proactively every 90 days or immediately after a suspected compromise.

---

## Secrets Inventory

| Secret | Storage | Rotation Frequency | Used By |
|--------|---------|-------------------|---------|
| `JWT_SECRET` | GitHub Actions Secret + .env | 90 days / on compromise | API (auth module) |
| `JWT_REFRESH_SECRET` | GitHub Actions Secret + .env | 90 days / on compromise | API (auth module) |
| `DATABASE_URL` | GitHub Actions Secret + .env | On compromise / DB rotation | API (Prisma) |
| `DB_PASSWORD` | GitHub Actions Secret + .env | 90 days | PostgreSQL |
| `STRIPE_SECRET_KEY` | GitHub Actions Secret + .env | On compromise / Stripe dashboard | API (payments module) |
| `STRIPE_WEBHOOK_SECRET` | GitHub Actions Secret + .env | On Stripe endpoint change | API (webhooks) |
| `AWS_ACCESS_KEY_ID` | GitHub Actions Secret + .env | 90 days | API (S3 uploads) |
| `AWS_SECRET_ACCESS_KEY` | GitHub Actions Secret + .env | 90 days | API (S3 uploads) |
| `SYNCHRONY_API_KEY` | GitHub Actions Secret + .env | Per Synchrony policy | API (financing — Phase 4+) |
| `GOOGLE_OAUTH_SECRET` | GitHub Actions Secret + .env | On compromise | API (auth module) |

---

## Rotation Procedures

### JWT_SECRET / JWT_REFRESH_SECRET

**Impact:** All active sessions will be invalidated. Users must re-login.

```bash
# 1. Generate new secret (minimum 64 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Update GitHub Actions Secret:
#    GitHub → Settings → Secrets → Actions → JWT_SECRET → Update

# 3. Update local .env (never commit this file)
# JWT_SECRET=<new_value>

# 4. Deploy API (sessions using old secret become invalid immediately)
# 5. Monitor error logs for auth failures post-deploy
```

### Database Password (DB_PASSWORD)

```bash
# 1. Connect to PostgreSQL as superuser
psql -U postgres

# 2. Generate new password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Update password in PostgreSQL
ALTER USER indor_user WITH PASSWORD '<new_password>';

# 4. Update DATABASE_URL in GitHub Secrets:
# postgresql://indor_user:<new_password>@host:5432/indor_db

# 5. Update local .env
# 6. Restart API service (Prisma will use new DATABASE_URL)
# 7. Verify connection: npm run prisma:status
```

### Stripe Keys

```bash
# 1. Go to Stripe Dashboard → Developers → API keys
# 2. Click "Roll key" for secret key
#    (Stripe keeps old key valid for 24 hours — zero downtime rotation)
# 3. Copy new secret key
# 4. Update GitHub Secret: STRIPE_SECRET_KEY
# 5. Update local .env
# 6. Deploy API
# 7. After 24 hours, old key is automatically invalidated by Stripe
```

### AWS S3 Credentials

```bash
# 1. Go to AWS IAM → Users → indor-s3-user → Security credentials
# 2. Create new access key
# 3. Update GitHub Secrets: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
# 4. Update local .env
# 5. Deploy API
# 6. Verify S3 uploads work: test via staging
# 7. Deactivate old access key in AWS IAM
# 8. After 24 hours, delete old access key
```

---

## Updating GitHub Actions Secrets

```
GitHub Repository → Settings → Secrets and variables → Actions
→ Find secret → Update
```

Secrets needed for CI/CD:
```
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
```

---

## Verification Checklist

After any secret rotation:
- [ ] New secret is in GitHub Actions Secrets
- [ ] Local `.env` updated (never committed)
- [ ] API deployed and healthy (`GET /health` returns 200)
- [ ] Auth flow tested (login + token refresh)
- [ ] Critical API endpoints tested (orders, payments)
- [ ] No errors in structured logs
- [ ] AuditLog records being created correctly

---

## Notes

- **Never** store secrets in code, comments, or commit history
- **Never** log secrets, even in debug mode
- Use `git log -p | grep -i secret` periodically to check for accidental commits
- Run `gitleaks detect` locally before pushing if unsure
