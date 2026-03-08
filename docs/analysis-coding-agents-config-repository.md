# Analysis: coding-agents-config Repository

## Overview

The **coding-agents-config** repository is a sophisticated, centralized configuration system for Claude Code's agentic pipeline. It functions as a shared, symlink-distributed skill and agent library that enables every project using Claude Code to access a unified set of specialized agents, domain-specific skills, and governance rules. By symlinking into `~/.claude/` and `~/.codex/`, this configuration automatically makes 40+ skills and 14 specialist agents available across all projects globally without reinstalling.

The system implements a **turn-based lifecycle** with mandatory provenance tracking, ensuring every prompt generates structured artifacts (`session_context.md`, `execution_trace.json`, `pull_request.md`, `adr.md`, and `manifest.json`) that create a complete audit trail of all Claude Code activities. This architecture enforces strict governance policies, automatic skill suggestion via hooks, branch protection, and parallel agent coordination with clear file scope ownership.

## Key Findings

1. **Comprehensive Agent Architecture**: 14 specialist agents (orchestrator, engineers for Next.js/NestJS/Spring/Drizzle, reviewers, security auditors, test writers, doc generators) all default to Haiku model with standardized file scope ownership to enable safe parallelization.

2. **Turn Lifecycle Automation**: Every user prompt automatically triggers turn initialization (via `turn-init.sh` hook) which creates a sequential turn directory (`turn-N/`), records start time, detects explicitly requested skills, and initializes `execution_trace.json` for provenance tracking.

3. **Intelligent Skill Suggestion System**: The `skill-eval` hook uses regex patterns, directory matching, keyword detection, and intent analysis to suggest relevant domain skills (pattern-nextjs, pattern-drizzle, pattern-testing, etc.) with priority scoring and confidence levels based on `skill-rules.json`.

4. **Mandatory Governance Enforcement**: Three rule files (branch-operations.md, tech-standards.md, agent-coordination.md) establish non-negotiable standards: strict TypeScript (`strict: true`, no `any`), security practices (parameterized queries, no hardcoded secrets), conventional commits with Claude co-authorship, and branch protection that blocks direct edits to `main`/`master`.

5. **One-Command Full-Stack Builds**: The `/project-execute` skill implements a "golden path contract" that scaffolds, parses specs (PRD/DDD), generates epics, executes implementation, verifies quality, and completes turn artifacts — all from a single command with preflight validation.

6. **Fine-Grained Hook System**: SessionStart loads context files and displays turn status; UserPromptSubmit triggers turn initialization and skill evaluation; PreToolUse blocks unsafe branch operations and git commands; PostToolUse auto-formats code, runs tests, and typechecks on file modifications.

7. **Structured Specification System**: Separate spec skills (`spec-prd-parse`, `spec-epic-start`, `spec-task-next`) parse Product Requirements Documents into domain-driven design epics with explicit task boundaries, enabling orchestrator to execute multi-step implementations.

8. **Framework-Specific Pattern Libraries**: Nine pattern skills (pattern-nextjs, pattern-nestjs, pattern-spring, pattern-drizzle, pattern-shadcn, pattern-vercel-ai, pattern-testing, pattern-react-ui, pattern-api-design) embed expert guidance on framework-specific idioms, conventions, and anti-patterns.

9. **Distributed Symlink Architecture**: All skills, agents, rules, hooks, templates, and settings symlink into project-local `.claude/` or user-global `~/.claude/` directories, allowing changes to be propagated instantly across all projects via `git pull` — no reinstall required.

10. **Provenance and Audit Trail**: The `manifest.schema.json` defines a comprehensive JSON schema for turn artifacts, including task-level details (inputs, outputs, SHA-256 hashes), validation rules (tests-pass, lint-clean, typecheck, build-succeeds, security-scan), and full timestamps for reproducibility and compliance.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `CLAUDE.md` | Global instructions for all projects (turn lifecycle, artifact requirements, post-execution responsibilities) |
| `settings.json` | Claude Code configuration (model defaults, permissions, hooks, environment variables, cleanup policies) |
| `rules/` | Non-negotiable governance rules (branch-operations.md, tech-standards.md, agent-coordination.md) |
| `hooks/` | Lifecycle hooks triggered by Claude Code events (turn-init.sh, skill-eval.sh, skill-eval.js, skill-rules.json, audit-log.sh) |
| `skills/` | 40+ slash-command skills organized by category (git-*, pattern-*, project-*, spec-*, governance, session, quality, debug) |
| `agents/` | 14 specialist agent definitions with file scope ownership and model assignments |
| `templates/` | Reusable templates for turn artifacts (turn/, pr/, adr/, contexts/, governance/, stack/) |
| `scripts/` | Automation scripts (setup.sh, project-execute-preflight.sh, get-next-turn-id.sh) |
| `docs/` | Reference documentation (agents.md, skills.md, hooks.md, project-execute-contract.md, analysis reports) |
| `ai/agentic-pipeline/turns/` | Turn execution artifacts organized by turn ID |
| `plugins/` | Plugin registry (blocklist.json, install-counts-cache.json) |
| `vault/` | Obsidian vault with analysis notes and decision records |

## Agents Inventory

| Agent | Model | Purpose | File Scope |
|-------|-------|---------|-----------|
| `orchestrator` | haiku | Master coordinator for full-stack development; delegates to specialists | N/A (coordinator) |
| `code-architect` | haiku | System design specialist; designs API contracts, database schemas | N/A (shared scope) |
| `nextjs-engineer` | haiku | Next.js 15 App Router specialist | `app/web/src/app/**`, `app/web/src/components/**` |
| `nestjs-engineer` | haiku | NestJS specialist; builds modules, controllers, services | `app/api/src/modules/<feature>/**` |
| `spring-engineer` | haiku | Spring WebFlux + R2DBC specialist | `app/services/enterprise/src/main/java/**` |
| `drizzle-dba` | haiku | Database specialist; Drizzle ORM, PostgreSQL | `app/packages/database/schema/**`, `app/packages/database/migrations/**` |
| `ai-engineer` | haiku | AI integration specialist; Vercel AI SDK features | N/A (shared scope) |
| `test-writer` | haiku | TDD specialist; unit, integration, E2E tests | `**/*.test.ts`, `**/*.spec.ts`, `app/e2e/**` |
| `code-reviewer` | haiku | Senior engineer code reviewer | N/A (review scope) |
| `security-auditor` | haiku | Security specialist; OWASP Top 10 | N/A (review scope) |
| `verify-app` | haiku | Full quality gate | N/A (validation scope) |
| `git-guardian` | haiku | Git workflow specialist | N/A (git operations) |
| `doc-generator` | haiku | Documentation specialist | `**/*.md`, JSDoc in any file |
| `analyze-engineer` | haiku | Analysis specialist | N/A (analysis scope) |

## Issues Identified

### HIGH Severity

1. **Post-Execution Artifact Generation is Manual**: The CLAUDE.md instructions state that post-execution responsibilities (steps 6-10) fall on the user. No automated hook enforces this, creating risk of incomplete provenance records.

2. **Skill Evaluation Scoring May Be Inconsistent**: The skill-eval.js implementation relies on weights and patterns, but there is no documented fallback or guarantee that top suggestion will be correct.

3. **No Explicit Conflict Detection in Parallel Execution**: No PreToolUse or PostToolUse hook detects file scope violations or git merge conflicts before they occur.

4. **Global Symlink Strategy Has Single-Point-of-Failure Risk**: All projects depend on symlinks into `~/.claude/`. No backup or fallback mechanism is documented.

### MEDIUM Severity

5. **Turn ID Resolution Script is Called Repeatedly**: Could cause latency on every prompt; potential race conditions.

6. **Preflight Validation Script Not Verified**: The project-execute-contract.md references `project-execute-preflight.sh` as mandatory.

7. **No Explicit Rate Limiting or Quota on Turns**: Turn directories grow indefinitely.

8. **Tech Standards Are Aspirational, Not Enforced**: No validation hook for TypeScript strictness or security rules.

9. **Skill Rules JSON Has No Validation Schema**: Could cause silent failures in skill evaluation.

### LOW Severity

10. **Documentation is Fragmented Across Multiple Files**: No single source of truth or auto-generated index.

11. **Vault Directory Contains Obsidian Metadata**: Should not be in version control for a shared repo.

12. **Setup Script Requires Manual Symlink Management**: No uninstall/rollback script.

## Recommendations

### Priority 1: Enforce Post-Execution Artifact Generation
- Create a PostToolUse hook that auto-generates post-execution artifacts
- Implement turn artifact validation skill
- Add turn cleanup automation

### Priority 2: Harden Project Execute Contract
- Verify project-execute-preflight.sh exists and is complete
- Add manifest.json generation to project-execute skill
- Implement preflight retry logic with detailed error messages

### Priority 3: Add Conflict Detection and Prevention
- Create file scope validation hook
- Implement git merge conflict detection
- Add turn sequencing validation

### Priority 4: Improve Documentation and Developer Experience
- Create a skill/agent/hook registry document
- Add JSON schema for skill-rules.json
- Create uninstall/rollback script

### Priority 5: Optimize Performance and Scalability
- Cache turn ID resolution
- Implement turn archive strategy
- Add skill-eval caching

### Priority 6: Remove Non-Critical Files from Version Control
- Move Obsidian vault to .gitignore
- Document plugin directory purpose

---
Generated: 2026-03-05
Analyzed by: Explore agent
