---
name: repo-analysis
description: Analyze a code repository and generate a comprehensive markdown report. Triggers on "analyze repo", "analyze repository", "analyze codebase", "repo overview", "codebase overview", or any request to understand a project's structure, tech stack, and architecture.
---

# Repository Analysis

Analyze the current repository and produce a structured markdown report.

## Process

1. **Gather context** — Read package.json, README, config files to identify tech stack
2. **Map structure** — Glob for source directories, identify frontend/backend/database layers
3. **Identify domain** — Find entities, schemas, models to document the domain
4. **Assess quality** — Check for tests, types, linting, security patterns
5. **Analyze dependencies** — Review package manifests for risks and versions
6. **Count files** — Generate statistics on file types
7. **Write report** — Output to `docs/analysis/YYYY-MM-DD__repo__{project-name}.md`

## Output Template

```markdown
# Codebase Analysis — {project-name}

- Generated: {YYYY-MM-DD}
- Turn: {turn-number-or-N/A}
- Branch: {branch-name-or-N/A}

---

## Executive Summary

{1–2 paragraph summary of the repository, architecture style, and overall maturity.}

---

## Architecture Overview

<
{high level directory tree of repository}
>

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | {framework} | {version} |
| UI Framework | {framework} | {version} |
| Backend | {framework} | {version} |
| ORM | {tool} | {version} |
| Database | {database} | {version or N/A} |
| Package Manager | {tool} | {version} |
| Build Tool | {tool} | {version} |

---

## Domain Model

### Primary Aggregates

| Entity | Description |
|--------|-------------|
| {entity-name} | {short description} |

### Entity Fields

| Field | Type | Description |
|-------|------|-------------|
| {field} | {type} | {description} |

### Key Filters / States / Enums

{list or table if applicable}

---

## Key Components

### Backend

| File | Purpose |
|------|---------|
| {file-path} | {description} |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | {endpoint} | {purpose} |
| POST | {endpoint} | {purpose} |
| PATCH | {endpoint} | {purpose} |
| DELETE | {endpoint} | {purpose} |

### Frontend

| File | Purpose |
|------|---------|
| {file-path} | {description} |

### UI Architecture Notes

{short explanation of page structure, component hierarchy, client/server usage}

---

## Code Quality Assessment

### Strengths

1. {strength}
2. {strength}
3. {strength}

### Areas for Improvement

| Issue | Severity | Location |
|-------|----------|----------|
| {issue} | {High/Medium/Low} | {path} |

---

## Test Coverage

| Area | Status | Notes |
|------|--------|-------|
| Backend | {coverage or description} | {details} |
| Frontend | {coverage or description} | {details} |
| E2E | {coverage or description} | {details} |

---

## Dependencies Analysis

### Frontend Dependencies

Risk Level: {Low/Medium/High}

Observations:
- {dependency observation}

### Backend Dependencies

Risk Level: {Low/Medium/High}

Observations:
- {dependency observation}

---

## File Statistics

| Category | Count |
|----------|-------|
| TypeScript source files | {count} |
| React components | {count} |
| API modules | {count} |
| Test files | {count} |
| Spec documents | {count} |

---

## Recommendations

### High Priority

1. {recommendation}
2. {recommendation}

### Medium Priority

1. {recommendation}
2. {recommendation}

### Low Priority

1. {recommendation}
2. {recommendation}

---

## Evidence

### Files Examined

- {path}:{lines} — {why relevant}

### Searches Performed

Glob patterns:
- {pattern}

Grep queries:
- {query}

---

## Conclusion

{short final assessment of the codebase maturity and readiness}
```

## Rules

- Fill every section; use "N/A" or "Not found" if data unavailable
- Extract versions from package.json, pom.xml, build.gradle, or equivalent
- For monorepos, document each workspace/package
- Keep evidence section accurate — list actual files read and queries run
