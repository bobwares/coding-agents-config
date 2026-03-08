# NFR Checklist

<!-- -------------------------------------------------------------------
Version: 1.0.0
Author: Claude <noreply@anthropic.com>
Created: 2026-03-06
Modified: 2026-03-06
Description: Production readiness checklist derived from NON_FUNCTIONAL_SPEC.md.
             Use this checklist to verify NFR compliance per project.
             Mark items as [x] when complete, [~] for partial, [-] for N/A with ADR.
------------------------------------------------------------------- -->

## Instructions

1. Copy this checklist to your project's `docs/` directory
2. Complete each section before production release
3. Any `[-]` (N/A) items require an ADR documenting the exception
4. This checklist is part of the Definition of Done for production releases

---

## 1. Reliability and Availability

### 1.1 Service Objectives
- [ ] SLOs defined (availability, latency, error rate)
- [ ] SLIs documented and implemented
- [ ] Error budget policy defined
- [ ] Availability target: ___% (default: 99.9%)
- [ ] Latency targets: p95=___ms, p99=___ms

### 1.2 Resilience Patterns
- [ ] Timeouts configured for all network calls
- [ ] Retries with exponential backoff and jitter
- [ ] Circuit breaker or bulkhead isolation for high-risk dependencies
- [ ] Graceful degradation for non-critical dependencies

### 1.3 Fault Handling
- [ ] Errors categorized (client/server/dependency/validation)
- [ ] User-facing error messages are deterministic and safe

---

## 2. Observability

### 2.1 Telemetry Pillars
- [ ] Metrics exported to observability platform
- [ ] Logs shipped to centralized logging
- [ ] Traces exported to tracing backend
- [ ] Health endpoints exposed

### 2.2 Metrics
- [ ] System metrics (CPU, memory, GC)
- [ ] Request count/error/duration per route
- [ ] Dependency call metrics
- [ ] Business/journey metrics
- [ ] Required labels present (service_name, environment, version, etc.)

### 2.3 Distributed Tracing
- [ ] Trace context propagation (HTTP headers, messaging)
- [ ] Root span created for inbound requests/jobs
- [ ] Trace IDs in logs
- [ ] Trace IDs in responses (where appropriate)
- [ ] Spans for dependency calls (DB, cache, APIs)
- [ ] Sampling policy documented

### 2.4 Health Endpoints
- [ ] `/health/live` - liveness check
- [ ] `/health/ready` - readiness check
- [ ] Dependency health status available

### 2.5 Alerting
- [ ] Burn-rate alert for error budget
- [ ] High error rate alert
- [ ] Elevated latency alert
- [ ] Dependency failure alerts
- [ ] Queue backlog alerts (if applicable)
- [ ] Crash loop detection
- [ ] All alerts link to runbook

---

## 3. Logging

### 3.1 Format
- [ ] Structured JSON logs in production
- [ ] Required fields present:
  - [ ] timestamp, level, message
  - [ ] service_name, environment, version
  - [ ] request_id/correlation_id
  - [ ] trace_id, span_id (when available)
  - [ ] operation/route name
  - [ ] error_class, error_code (for errors)

### 3.2 Log Levels
- [ ] DEBUG disabled in production by default
- [ ] INFO used for key lifecycle events
- [ ] ERROR includes stack traces
- [ ] Stable error_code for all errors

### 3.3 Content Security
- [ ] No secrets in logs (verified)
- [ ] No unmasked PII in logs (verified)

### 3.4 Retention
- [ ] Retention policy: ___ days (default: 30)
- [ ] Access controls configured

---

## 4. Operations

### 4.1 Runbook
- [ ] Service overview documented
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Alert catalog with remediation steps
- [ ] Common failure modes documented
- [ ] Data ownership and backups (if stateful)

### 4.2 On-Call
- [ ] Primary owner: _______________
- [ ] Secondary owner: _______________
- [ ] Escalation path documented
- [ ] Severity levels defined
- [ ] Post-incident review process defined

### 4.3 Backups (Stateful Systems Only)
- [ ] RPO defined: _______________
- [ ] RTO defined: _______________
- [ ] Automated backups configured
- [ ] Restore procedure documented
- [ ] Restore test completed: _______________

### 4.4 Maintenance
- [ ] Dependency upgrade cadence: _______________
- [ ] Deprecation policy documented

---

## 5. Security

### 5.1 Authentication and Authorization
- [ ] Centralized identity (OIDC/OAuth2/SAML)
- [ ] Server-side authorization enforced
- [ ] Least privilege for service accounts

### 5.2 Secrets Management
- [ ] Secrets in secret manager (not in code/config)
- [ ] Rotation supported
- [ ] Fail-safe behavior if secrets missing

### 5.3 Encryption
- [ ] TLS for all external network traffic
- [ ] Encryption at rest for production data

### 5.4 Vulnerability Management
- [ ] Dependency scanning in CI
- [ ] Container/image scanning in CI
- [ ] Remediation SLAs documented
- [ ] Latest scan date: _______________
- [ ] Critical/High vulnerabilities: ___

### 5.5 Auditability
- [ ] Security events logged (logins, permission changes, admin actions)
- [ ] Audit log retention: _______________

---

## 6. Performance and Scalability

### 6.1 Performance Budgets
- [ ] API latency targets defined
- [ ] Frontend bundle size targets (if UI)
- [ ] Performance regression tracking in CI

### 6.2 Capacity Planning
- [ ] Scaling strategy documented
- [ ] Key bottlenecks identified
- [ ] Load test completed: _______________

### 6.3 Resource Limits
- [ ] CPU/memory limits configured
- [ ] Rate limiting on public endpoints

---

## 7. Data Management

### 7.1 Data Classification
- [ ] Data classification completed
- [ ] Restricted data storage locations documented

### 7.2 Retention and Deletion
- [ ] Retention policy per data type
- [ ] Deletion procedures documented
- [ ] User deletion requests supported (if applicable)

### 7.3 Schema and Migrations
- [ ] Versioned migrations
- [ ] Backward compatible for rolling deploys

---

## 8. Deployments and Release Engineering

### 8.1 CI/CD Pipeline
- [ ] Automated builds
- [ ] Linting/static checks
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security scans
- [ ] Artifacts versioned with commit SHA

### 8.2 Release Strategy
- [ ] Deployment strategy: [ ] Blue/green [ ] Canary [ ] Phased
- [ ] Rollback tested and < ___ minutes

### 8.3 Feature Flags
- [ ] Feature flag system in place
- [ ] Kill switches for risky features
- [ ] Flag ownership and cleanup policy

---

## 9. Compliance and Governance

### 9.1 Documentation
- [ ] Architecture overview
- [ ] Dependency list
- [ ] Data flow diagram (sensitive systems)
- [ ] ADRs for major decisions

### 9.2 Environment Separation
- [ ] Dev/stage/prod separated
- [ ] Production data not in non-prod (or anonymized with approval)

---

## 10. UI/Frontend (If Applicable)

### 10.1 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Proper semantic markup

### 10.2 UX and Resilience
- [ ] Offline/slow network handling
- [ ] No sensitive data in client logs/errors

### 10.3 Frontend Observability
- [ ] Performance metrics captured
- [ ] Session IDs correlated with backend traces

---

## 11. Production Readiness Summary

| Category | Status | Notes |
|----------|--------|-------|
| Reliability | [ ] Ready | |
| Observability | [ ] Ready | |
| Logging | [ ] Ready | |
| Operations | [ ] Ready | |
| Security | [ ] Ready | |
| Performance | [ ] Ready | |
| Data Management | [ ] Ready | |
| CI/CD | [ ] Ready | |
| Compliance | [ ] Ready | |
| Frontend (if applicable) | [ ] Ready | |

---

## 12. Exceptions

List any NFR exceptions with ADR references:

| Requirement | ADR Reference | Review Date |
|-------------|---------------|-------------|
| | | |

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Engineering Lead | | |
| Security Review | | |
| Operations/SRE | | |
