---
name: af-app-check
description: Audit an application for production readiness across security, database, deployment, and code quality. Use this before release, after major feature work, or before handing a system to QA, staging, or production operations.
---

# AF App Check

## Purpose

This skill performs a structured production-readiness review of an application and its deployment configuration.

The review must inspect actual implementation artifacts wherever possible, including:

- Source code
- Environment configuration
- Deployment manifests
- Reverse proxy or ingress configuration
- Authentication and session handling
- Database access code
- Migration files
- CI/CD files
- Runtime process configuration
- Frontend production build settings

Do not assume compliance from framework defaults alone. Verify by evidence.

## Required Behavior

When running this skill, you must:

1. Audit the codebase and deployment artifacts against every checklist item.
2. Mark each item as one of:
   - `PASS`
   - `FAIL`
   - `UNKNOWN`
3. For every item, provide:
   - status
   - short rationale
   - evidence with file paths, code locations, or config references
4. Treat `UNKNOWN` as unresolved risk, not as a soft pass.
5. Call out any issue that could block production release.
6. End with:
   - overall readiness assessment
   - blocker list
   - remediation actions in priority order

## Audit Rules

### Evidence Standard

A check may only be marked `PASS` when there is direct evidence in code, configuration, or deployment artifacts.

Examples of acceptable evidence:

- `apps/api/src/auth/jwt.strategy.ts`
- `infra/nginx/default.conf`
- `docker-compose.prod.yml`
- `helm/templates/ingress.yaml`
- `src/lib/db.ts`
- `prisma/migrations/...`
- `ecosystem.config.js`
- `package.json` scripts
- CI workflow files under `.github/workflows/`

Examples of insufficient evidence:

- "The framework usually does this"
- "This is probably handled by the cloud provider"
- "I did not see anything wrong"

### Severity Rules

Classify findings using these severities:

- `BLOCKER` — unsafe for production release
- `HIGH` — serious risk, should be fixed before release
- `MEDIUM` — should be fixed soon, but may not block release
- `LOW` — improvement recommended

Use `BLOCKER` for issues such as:

- secrets exposed in frontend code
- unauthenticated sensitive endpoints
- wildcard CORS in production
- missing HTTPS enforcement
- unhashed passwords
- missing token expiry
- SQL string concatenation
- no tested backup restore path
- production app using root DB user

## Review Checklist

### Security

Audit all of the following:

- No API keys or secrets in frontend code
- Every route checks authentication, including non-obvious endpoints
- HTTPS enforced everywhere and HTTP redirected
- CORS restricted to approved domains, never wildcard in production
- Input validated and sanitized server-side
- Rate limiting present on auth and sensitive endpoints
- Passwords hashed with `bcrypt` or `argon2`
- Auth tokens have explicit expiry
- Sessions invalidated on logout server-side

### Database

Audit all of the following:

- Backups configured and restore procedure tested
- Parameterized queries used everywhere, no string concatenation
- Separate development and production databases
- Connection pooling configured
- Migrations stored in version control
- Application uses a non-root database user

### Deployment

Audit all of the following:

- All required environment variables set in production deployment
- SSL certificate installed and valid
- Firewall restricted so only `80` and `443` are public unless explicitly justified
- Process manager configured, such as `PM2` or `systemd`
- Rollback plan exists
- Staging validation completed before production deploy

### Code

Audit all of the following:

- No `console.log` statements in the production build path
- Error handling exists for all async operations
- UI has loading and error states
- Pagination exists on all list endpoints
- `npm audit` reviewed and critical issues resolved

## Inspection Guidance

### Security Inspection Guidance

Check:

- frontend environment usage such as `NEXT_PUBLIC_*`, embedded constants, client bundles
- backend middleware, guards, interceptors, and route decorators
- reverse proxy, ingress, load balancer, or app-level HTTPS redirect logic
- CORS config in server bootstrap and proxy layers
- DTO validation, schema validation, request parsing, sanitization
- throttling middleware or gateway rules
- password hashing implementation in registration, reset, migration, and seed flows
- JWT or session expiry configuration
- logout flow for token revocation, session deletion, cookie invalidation, or server-side store invalidation

### Database Inspection Guidance

Check:

- ORM or query-builder usage
- raw SQL execution paths
- DB connection configuration by environment
- migration tooling such as Prisma, TypeORM, Knex, Flyway, Liquibase, Alembic
- backup jobs, snapshots, managed backup policies, and restore runbooks
- database credentials and least-privilege access

### Deployment Inspection Guidance

Check:

- `.env.example`, deployment manifests, secrets references, Helm values, compose files
- TLS termination and certificate config
- cloud firewall or host firewall config
- `systemd` unit files, `pm2` ecosystem files, container restart policies
- rollback docs or deployment scripts
- staging pipeline gates, smoke tests, release workflow

### Code Inspection Guidance

Check:

- production logging hygiene
- `try/catch`, promise rejection handling, framework exception filters
- frontend loading, empty, retry, and error states
- list endpoints for `limit`, `offset`, cursor, or page-based pagination
- dependency audit output and package remediation history

## Output Format

Return results in this exact structure.

### Summary

- Overall status: `READY` | `READY WITH RISKS` | `NOT READY`
- Blockers: `<count>`
- High severity issues: `<count>`
- Medium severity issues: `<count>`
- Low severity issues: `<count>`

### Findings

For each checklist item, use this format:

#### `<Category> — <Checklist Item>`

- Status: `PASS | FAIL | UNKNOWN`
- Severity: `BLOCKER | HIGH | MEDIUM | LOW`
- Evidence:
  - `<file path or config reference>`
  - `<file path or config reference>`
- Rationale: `<short explanation>`
- Remediation: `<specific corrective action>`

### Release Decision

Provide one of:

- `READY FOR PRODUCTION`
- `NOT READY FOR PRODUCTION`

Then explain the decision in 3 to 8 sentences.

### Priority Remediation Plan

List fixes in descending priority order.

For each item include:

1. issue
2. why it matters
3. exact implementation target
4. expected verification step

## Default Operating Assumptions

Unless the repository clearly proves otherwise:

- production means public internet exposure
- authentication is required for all non-public business endpoints
- wildcard CORS is unacceptable in production
- secrets in client code are a release blocker
- missing restore validation is not acceptable for backup compliance
- framework defaults do not count as proof without configuration evidence

## Preferred Review Style

Be strict, explicit, and evidence-driven.

Do not soften findings.
Do not invent missing implementation.
Do not mark items as passed without proof.
Do not stop after finding a few issues; complete the full checklist.
