# Non-Functional Specification (Global Baseline)

<!-- -------------------------------------------------------------------
Version: 1.0.0
Author: Claude <noreply@anthropic.com>
Created: 2026-03-06
Modified: 2026-03-06
Description: Mandatory non-functional requirements (NFRs) that apply to
             every application, service, job, worker, or UI built under
             this governance. Stack-agnostic and enforceable.
------------------------------------------------------------------- -->

## Scope

This document defines mandatory non-functional requirements (NFRs) that apply to every application, service, job, worker, or UI you build, unless a project explicitly records an exception in an ADR.

---

## 1. Reliability and Availability

### 1.1 Service Objectives

Each production system must define:

| Artifact | Description |
|----------|-------------|
| **SLOs** | Availability, latency, error rate per critical user journey or API |
| **SLIs** | Metrics used to measure each SLO |
| **Error Budget Policy** | Actions when budget is exhausted |

**Default Targets** (unless overridden by product needs):

| Metric | Target |
|--------|--------|
| Availability SLO | 99.9% for user-facing APIs |
| Latency SLO | p95 and p99 thresholds per endpoint (documented in runbook) |

### 1.2 Resilience Patterns

| Pattern | Requirement |
|---------|-------------|
| **Timeouts** | Must implement for all network calls (client and server) |
| **Retries** | Must implement exponential backoff with jitter for transient failures |
| **Circuit Breaking** | Must implement circuit breaker or bulkhead isolation for high-risk dependencies |
| **Graceful Degradation** | Must degrade gracefully when non-critical dependencies fail (feature flags, fallbacks, cached reads) |

### 1.3 Fault Handling

- All errors must be categorized: `client` | `server` | `dependency` | `validation`
- User-facing apps must provide deterministic error messages without leaking secrets

---

## 2. Observability

### 2.1 Required Telemetry Pillars

| Pillar | Requirement |
|--------|-------------|
| **Metrics** | Mandatory for all production workloads |
| **Logs** | Mandatory for all production workloads |
| **Traces** | Mandatory for all production workloads |
| **Health Endpoints** | Must expose health and runtime diagnostics |

### 2.2 Metrics Requirements

**Required Metric Categories:**

| Category | Examples |
|----------|----------|
| System | CPU, memory, GC (if applicable) |
| Application | Request count, error count, duration histogram per route |
| Business | Key journey metrics, conversion events |
| Dependencies | Call count, error count, duration per dependency |
| Async Systems | Queue depth, lag, job success/failure/latency |

**Required Labels/Tags:**

```
service_name, environment, version, region, instance_id
route (low-cardinality), http_method, status_class
```

### 2.3 Distributed Tracing

| Requirement | Description |
|-------------|-------------|
| Context Propagation | Must propagate trace context across service boundaries (HTTP, messaging) |
| Root Spans | Must create root span for each inbound request / job execution |
| Trace IDs | Must include in responses (when appropriate) and logs |
| Dependency Spans | Must create spans for DB, cache, external API calls |
| Sampling | Head-based sampling with higher sampling for errors; document policy |

### 2.4 Health and Readiness

| Endpoint | Purpose |
|----------|---------|
| **Liveness** | Process is running |
| **Readiness** | Ready to serve traffic (dependencies optional but declared) |
| **Dependency Status** | Internal endpoint showing DB/cache/upstream health |

### 2.5 Alerting

**Required Alerts:**

- Burn-rate alerts for error budget consumption
- High error rate
- Elevated latency
- Dependency failures
- Queue backlog
- Crash loops

**Alert Requirements:**

- Every alert must link to a runbook
- Every alert must include remediation steps

---

## 3. Logging

### 3.1 Format and Structure

All logs must be **structured JSON** in production.

**Required Fields:**

| Field | When |
|-------|------|
| `timestamp` | Always |
| `level` | Always |
| `message` | Always |
| `service_name` | Always |
| `environment` | Always |
| `version` | Always |
| `request_id` / `correlation_id` | When available |
| `trace_id` | When available |
| `span_id` | When available |
| `actor` / `user_id` | If authenticated |
| `tenant_id` | If multi-tenant |
| `operation` / `route` | Always |
| `error_class` | For errors |
| `error_code` | For errors |

### 3.2 Log Levels

| Level | Usage | Production Default |
|-------|-------|-------------------|
| `DEBUG` | Verbose diagnostics | Disabled |
| `INFO` | Key lifecycle and business events | Enabled (low volume) |
| `WARN` | Recoverable anomalies | Enabled |
| `ERROR` | Failed operations requiring investigation | Enabled |
| `FATAL` | Unrecoverable; process will exit | Enabled |

### 3.3 Content Rules

| Rule | Enforcement |
|------|-------------|
| No secrets | API keys, tokens, credentials, session cookies must never appear |
| No PII | Unless explicitly approved and masked per PII policy |
| Stack traces | Required for ERROR level (server-side) |
| Error codes | Required stable `error_code` for all errors |

### 3.4 Retention and Access

| Policy | Default |
|--------|---------|
| Retention | 30 days (longer only by explicit requirement) |
| Access | Role-based; production logs must be audited |

---

## 4. Operations

### 4.1 Runbooks and Operational Readiness

Every production system must ship with:

| Artifact | Contents |
|----------|----------|
| **Service Overview** | What it does, owners, dependencies |
| **Deployment Procedure** | Step-by-step deploy instructions |
| **Rollback Procedure** | Step-by-step rollback instructions |
| **Alert Catalog** | All alerts with remediation steps |
| **Failure Modes** | Common failures and diagnosis steps |
| **Data Ownership** | Backups (if stateful) |

**Definition of Done** for production release includes "on-call usable runbook."

### 4.2 On-Call and Incident Response

| Requirement | Description |
|-------------|-------------|
| Ownership | Primary and secondary owner defined |
| Escalation | Path and response expectations documented |
| Severity Levels | Incident levels and comms templates defined |
| Post-Incident | Every sev incident produces PIR with action items |

### 4.3 Backups and Disaster Recovery (Stateful Systems)

| Requirement | Description |
|-------------|-------------|
| RPO/RTO | Defined for each datastore |
| Automated Backups | Must be implemented |
| Restore Tests | Periodic validation required |
| Restore Procedure | Documented in runbook |

### 4.4 Maintenance

| Policy | Requirement |
|--------|-------------|
| Dependency Upgrades | Cadence defined (e.g., monthly patching) |
| Deprecation | Policy defined for APIs and schema changes |

---

## 5. Security

### 5.1 Authentication and Authorization

| Requirement | Description |
|-------------|-------------|
| Centralized Identity | Use OIDC/OAuth2/SAML where possible |
| Server-Side AuthZ | Enforce for every protected resource |
| Least Privilege | Service accounts must have minimal permissions |

### 5.2 Secrets Management

| Requirement | Description |
|-------------|-------------|
| Storage | Secrets in secret manager, not source control or config files |
| Rotation | Must be supported and documented |
| Fail-Safe | Applications must fail safe if secrets missing or invalid |

### 5.3 Transport and Encryption

| Requirement | Description |
|-------------|-------------|
| TLS | Required for all network traffic crossing trust boundaries |
| Encryption at Rest | Required for production data stores (or documented exception) |

### 5.4 Vulnerability Management

| Requirement | Description |
|-------------|-------------|
| Dependency Scanning | Must run in CI |
| Container Scanning | Must run in CI |
| Remediation SLAs | Critical: 48-72h, High: 7d, Medium/Low: scheduled |

### 5.5 Auditability

| Requirement | Description |
|-------------|-------------|
| Security Events | Logins, permission changes, admin actions must be logged |
| Tamper Resistance | Audit logs must be tamper-resistant where feasible |
| Retention | Longer retention if required by compliance |

---

## 6. Performance and Scalability

### 6.1 Performance Budgets

| Tier | Budget Type |
|------|-------------|
| API | p95/p99 latency targets |
| Frontend | Bundle size and performance targets |
| CI/CD | Regression tracking where feasible |

### 6.2 Capacity Planning

| Requirement | Description |
|-------------|-------------|
| Scaling Strategy | Horizontal/vertical strategy defined |
| Bottlenecks | Key bottlenecks identified |
| Load Testing | Required for critical paths before major launches |

### 6.3 Resource Limits

| Requirement | Description |
|-------------|-------------|
| CPU/Memory | Requests/limits defined; prevent runaway usage |
| Rate Limiting | Required on public endpoints |

---

## 7. Data Management

### 7.1 Data Classification

| Requirement | Description |
|-------------|-------------|
| Classification | Data classified: public, internal, confidential, restricted |
| Storage | Where restricted/regulated data is stored and processed |

### 7.2 Data Retention and Deletion

| Requirement | Description |
|-------------|-------------|
| Retention Policy | Defined per data type |
| Deletion | Enforced deletion policies |
| User Requests | Support deletion requests where applicable |

### 7.3 Schema and Migrations

| Requirement | Description |
|-------------|-------------|
| Versioned Migrations | Must use versioned migrations |
| Backward Compatibility | Required for rolling deploys (expand/contract pattern) |

---

## 8. Deployments and Release Engineering

### 8.1 CI/CD

**Required Pipeline Stages:**

| Stage | Contents |
|-------|----------|
| Build | Automated builds |
| Lint | Static checks |
| Test | Unit tests |
| Integration | Integration tests (where relevant) |
| Security | Security scans |
| Artifacts | Versioned with build provenance (commit SHA, build id) |

### 8.2 Release Strategies

| Requirement | Description |
|-------------|-------------|
| Safe Rollout | Blue/green, canary, or phased rollout |
| Rollback | Within minutes for stateless services |

### 8.3 Feature Flags

| Requirement | Description |
|-------------|-------------|
| Risky Changes | Must use feature flags |
| Kill Switches | Must provide kill switches |
| Ownership | Flags must have owners |
| Cleanup | Expiration/cleanup policy required |

---

## 9. Compliance and Governance

### 9.1 Documentation

**Required Artifacts:**

| Artifact | Description |
|----------|-------------|
| Architecture Overview | System design documentation |
| Dependency List | All external dependencies |
| Data Flow Diagram | Required for sensitive systems |
| ADRs | Major decisions and exceptions |

### 9.2 Environment Separation

| Requirement | Description |
|-------------|-------------|
| Separation | Dev/stage/prod with clear configuration boundaries |
| Production Data | Must not be used in non-prod unless approved and anonymized |

---

## 10. UI/Frontend Specific NFRs

*Apply when applicable.*

### 10.1 Accessibility

| Requirement | Description |
|-------------|-------------|
| WCAG | Must meet WCAG 2.1 AA (or documented exception) |
| Keyboard | Must support keyboard navigation |
| Semantics | Must use proper semantic markup |

### 10.2 UX and Resilience

| Requirement | Description |
|-------------|-------------|
| Offline/Slow Network | Must handle gracefully |
| Sensitive Data | Must not leak in client logs or error screens |

### 10.3 Observability

| Requirement | Description |
|-------------|-------------|
| Performance Metrics | Navigation timing, error rate |
| Correlation | Frontend session/request IDs correlated with backend traces |

---

## 11. Required Operational Artifacts

**Minimum deliverables before "production-ready":**

| Artifact | Description |
|----------|-------------|
| SLO/SLI Definitions | With alert rules or links |
| Dashboards | Golden signals + dependency health |
| Runbook | Deploy/rollback + incident diagnostics |
| Logging | Structured logs with correlation IDs |
| Tracing | End-to-end propagation validated |
| Security | Secrets management + least privilege + scan reports |

---

## 12. Exception Process

Any exception to a "Must" requirement requires an ADR with:

| Field | Description |
|-------|-------------|
| Requirement | Which requirement is being waived |
| Rationale | Why the exception is needed |
| Risk Assessment | What risks this introduces |
| Mitigations | How risks are being addressed |
| Review Date | Sunset date or review date |

---

## References

- See `NFR_CHECKLIST.md` for per-project verification checklist
- See `governance/SKILL.md` for coding standards enforcement
- See `governance-adr/SKILL.md` for ADR creation policy
