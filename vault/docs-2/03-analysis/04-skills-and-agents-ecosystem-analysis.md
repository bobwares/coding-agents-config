# Analysis: Skills and Agents Ecosystem

Generated: 2026-02-27

## Overview

The `coding-agents-config` repository is a centralized, version-controlled configuration hub that distributes 42 skills and 13 specialist agents across Claude Code and Codex installations via symlinks. The ecosystem is architected as a full-stack, AI-assisted software development pipeline capable of taking a project from raw requirements documents (PRD, DDD, tech stack) all the way through to a committed, verified pull request with no human intervention in the execution phases.

The system follows a clear separation of concerns: skills are slash-command entry points for humans (and orchestrators), while agents are spawnable specialist workers. A layered delegation model flows from entry-point skills (like `/project-execute`) through a master `orchestrator` agent, which then fans out to domain-specialist agents (`nextjs-engineer`, `drizzle-dba`, `spring-engineer`, etc.), each of which is guided by framework-specific pattern skills. This creates a coherent, self-reinforcing ecosystem where every layer has a clearly defined responsibility.

---

## Architecture

### How Agents and Skills Relate

Skills and agents serve distinct but complementary roles:

- **Skills** (`SKILL.md` files) are invoked by the user as slash commands (e.g., `/project-execute`, `/verify-all`). They define procedural workflows and may themselves spawn agents using the `Task` tool.
- **Agents** (`.md` files in `agents/`) are autonomous sub-agents spawned programmatically by skills or by other agents via the `Task` tool. They have model, tool, and behavioral constraints specified in YAML frontmatter.

The relationship is fundamentally a **command-delegation pattern**: user issues a skill slash command, the skill orchestrates one or more agents, and those agents may reference pattern skills for reference material.

### The Orchestration Model

There are two orchestration layers:

**Layer 1 — Skill-level orchestration**: Skills like `project-execute`, `spec-epic-start`, `github-issue`, `security-scan`, `verify-all`, `analyze`, and `diagnose-issue` directly spawn agents via the `Task` tool or by referencing agent names.

**Layer 2 — Agent-level orchestration**: The `orchestrator` agent is the master coordinator. It never writes code itself; it spawns all 12 other specialist agents according to task type using a routing table.

The `verify-app` agent has secondary orchestration authority: it spawns specialist engineer agents to fix failures after running verification checks, then re-verifies.

### The Delegation Hierarchy

```
User
  └── Skill slash commands (entry points)
        ├── /project-execute
        │     ├── /project-init (sub-skill)
        │     ├── /spec-parse-ddd (sub-skill)
        │     ├── /spec-planning (sub-skill)
        │     ├── /spec-prd-parse (sub-skill)
        │     └── orchestrator agent (per epic)
        │           ├── code-architect
        │           ├── nextjs-engineer  ──> invokes pattern-nextjs, pattern-react-ui
        │           ├── nestjs-engineer  ──> invokes pattern-nestjs
        │           ├── spring-engineer  ──> invokes pattern-spring, pattern-testing
        │           ├── drizzle-dba      ──> invokes pattern-drizzle
        │           ├── ai-engineer      ──> invokes pattern-vercel-ai
        │           ├── test-writer      ──> invokes pattern-testing
        │           ├── code-reviewer
        │           ├── security-auditor
        │           ├── doc-generator
        │           ├── verify-app       ──> spawns engineers on failure
        │           └── git-guardian
        ├── /spec-epic-start ──> orchestrator agent
        ├── /github-issue ──> orchestrator agent
        ├── /security-scan ──> security-auditor agent
        ├── /verify-all ──> spawns engineers on failure
        ├── /diagnose-issue ──> spawns engineer agents on approval
        ├── /analyze ──> spawns Explore sub-agent
        └── /git-commit-push-pr ──> invokes /verify-all (skill)
```

---

## Coverage Matrix

### Which Agents Reference Which Pattern Skills

| Agent | Pattern Skills Referenced |
|---|---|
| `nextjs-engineer` | `pattern-nextjs` |
| `nestjs-engineer` | `pattern-nestjs` |
| `spring-engineer` | `pattern-spring`, `pattern-testing` |
| `drizzle-dba` | `pattern-drizzle` |
| `ai-engineer` | `pattern-vercel-ai` |
| `test-writer` | `pattern-testing` |
| `code-architect` | none (self-contained) |
| `code-reviewer` | none (self-contained) |
| `verify-app` | none (self-contained) |
| `git-guardian` | none (self-contained) |
| `security-auditor` | none (self-contained) |
| `doc-generator` | none (self-contained) |
| `orchestrator` | none (delegates to all others) |

### Which Skills Spawn Which Agents

| Skill | Agents Spawned |
|---|---|
| `project-execute` | `orchestrator` (per epic), all agents transitively |
| `spec-epic-start` | `orchestrator` |
| `github-issue` | `orchestrator` |
| `security-scan` | `security-auditor` |
| `verify-all` | `nextjs-engineer`, `nestjs-engineer`, `drizzle-dba`, `spring-engineer`, `test-writer`, `code-architect` |
| `diagnose-issue` | `nextjs-engineer`, `nestjs-engineer`, `spring-engineer`, `drizzle-dba`, `test-writer` |
| `analyze` | Explore sub-agent (not a named agent) |
| `session-end` | `git-guardian` (conditionally) |
| `git-commit-push-pr` | invokes `verify-all` skill (not an agent directly) |

---

## Dependency Graph

### Skill-to-Skill Dependencies

```
/project-execute
  depends on: /project-init, /spec-parse-ddd, /spec-planning, /spec-prd-parse

/spec-epic-start
  depends on: /spec-prd-parse (precondition)

/git-commit-push-pr
  depends on: /verify-all

/spec-prd-parse
  depends on: /spec-parse-ddd (produces model.json used as input)

/spec-prd-new
  next step: /spec-prd-parse (recommended)

/spec-task-next
  depends on: /spec-epic-start (creates the epic.md it reads)
```

### Agent-to-Agent Dependencies (within the orchestrator)

```
Phase 1 — Foundation:
  drizzle-dba (schema) ──blocks──> nestjs-engineer, spring-engineer

Phase 2 — API:
  nestjs-engineer / spring-engineer ──blocks──> test-writer (API tests)
  nestjs-engineer / spring-engineer ──blocks──> nextjs-engineer (frontend)

Phase 3 — Frontend:
  nextjs-engineer ──blocks──> test-writer (E2E tests)
  ai-engineer (parallel with frontend if no conflicts)

Phase 4 — Quality (sequential):
  test-writer ──> security-auditor ──> doc-generator

Terminal:
  verify-app ──> git-guardian
```

---

## Strengths

1. **Clear separation of concerns** — Skills handle entry points and workflows; agents handle domain expertise; pattern skills handle reference material
2. **Uniform agent model** — All 13 agents use `claude-haiku-4-5` consistently for cost efficiency
3. **Comprehensive failure-routing** — `verify-all` and `verify-app` map specific failure types to the correct specialist agent
4. **Turn lifecycle with auditability** — Full traceability via turn directories, SHA-256 manifests, git tags, and CSV index
5. **DDD integration** — `spec-parse-ddd` to `spec-prd-parse` pipeline aligns generated code naming with domain language
6. **Safety enforcement** — Multiple layers enforce: never commit to main, always verify before PR, always get plan approval
7. **Pattern skills as copy-paste references** — Concrete code examples with anti-pattern sections
8. **Explicit governance** — Metadata headers, per-file semantic versioning, ADR requirements per turn
9. **Complete orchestrator routing** — All 12 specialist agents covered with non-overlapping task descriptions
10. **Stack-conditional scaffolding** — `project-init` only generates directories for the selected tech stack

---

## Issues Identified

### HIGH Severity

**H1 — `spec-parse-ddd` name mismatch**
Directory is `skills/spec-parse-ddd/` but YAML `name` is `ddd-parse`. Invoked as `spec-parse-ddd` in `project-execute`. Skill routing by name will fail.

**H2 — `github-issue` name mismatch**
Directory is `skills/github-issue/` but YAML `name` is `fix-issue`. README documents `/github-issue`. User-visible discrepancy breaks invocation.

**H3 — Missing template files**
`session-end` and `project-execute` reference templates that don't exist in the repository:
- `.claude/templates/pr/pull_request_template.md`
- `.claude/templates/adr/adr_template.md`
- `.claude/templates/turn/manifest.schema.json`

Post-execution lifecycle will fail without these.

**H4 — `verify-all` skips Java tests while `verify-app` forbids it**
`verify-all` runs `mvn clean package -DskipTests`. `verify-app` states "Never skip tests with `-DskipTests`." Quality gate is inconsistently enforced.

**H5 — Commit message format conflict**
`governance` mandates `AI Coding Agent Change:` format. `git-guardian` uses conventional commits (`feat(scope): description`). Both are active in the same ecosystem.

### MEDIUM Severity

**M1 — `pattern-api-design` not loaded by any agent**
`nestjs-engineer` and `spring-engineer` implement REST endpoints but neither references `pattern-api-design` in their work process.

**M2 — `nextjs-engineer` doesn't load `pattern-react-ui` or `pattern-shadcn`**
Builds React UIs but only references `pattern-nextjs`. Missing Four States Rule, skeleton loading, and shadcn patterns.

**M3 — `project-create-plan` and `spec-planning` overlap**
Both generate implementation plans from the same inputs with unclear differentiation.

**M4 — No standalone commands for `doc-generator` or `code-reviewer`**
These agents are only reachable through the orchestrator, limiting ad-hoc use.

**M5 — `verify-all` and `verify-app` check different Java pom.xml paths**
`verify-all` checks `services/enterprise/pom.xml`. `verify-app` checks both `api/pom.xml` and `services/enterprise/pom.xml`.

**M6 — `session-start` hardcodes "7 context files loaded"**
Not computed dynamically; will be incorrect in most project contexts.

**M7 — `analyze` uses Explore sub-agent type not defined in agents/**
Codex-specific agent type that may not function in Claude Code.

### LOW Severity

**L1 — README claims 40 skills; actual count is 42**
**L2 — `spring-engineer` includes JPA patterns despite R2DBC-only stack**
**L3 — `git-quick-commit` uses `git add -u` while `git-commit-push-pr` uses `git add -A`**
**L4 — `governance` exemption list not cross-referenced with `project-init`**
**L5 — `diagnose-issue` turn directory detection fails on fresh projects**

---

## Recommendations

| Priority | Action |
|----------|--------|
| **R1** | Fix the two name mismatches: change `ddd-parse` to `spec-parse-ddd` and `fix-issue` to `github-issue` in YAML frontmatter |
| **R2** | Resolve commit message format conflict — pick conventional commits or `AI Coding Agent Change:` and enforce consistently |
| **R3** | Fix `verify-all` Java test skip — remove `-DskipTests` to match `verify-app` behavior |
| **R4** | Document or create the missing template files referenced by `session-end` and `project-execute` |
| **R5** | Add `pattern-react-ui` and `pattern-shadcn` to `nextjs-engineer` work process; add `pattern-api-design` to `nestjs-engineer` and `spring-engineer` |
| **R6** | Create `/code-review` and `/doc-generate` wrapper skills for ad-hoc agent access |
| **R7** | Clarify `project-create-plan` vs `spec-planning` — either merge or document distinct use cases |
| **R8** | Unify Java pom.xml path references across `verify-all`, `verify-app`, and `project-init` |
| **R9** | Remove or isolate JPA section from `spring-engineer` to prevent reactive/blocking mix |
| **R10** | Make `session-start` context count dynamic or remove the hardcoded number |

---

## Files Examined

| File | Purpose |
|---|---|
| `README.md` | Repository overview, setup, skill/agent inventory |
| `docs/README-agents.md` | Detailed agent reference |
| `docs/README-skills.md` | Detailed skill reference |
| `agents/agent-orchestrator.md` | Master coordinator agent |
| `agents/agent-code-architect.md` | System design agent |
| `agents/agent-code-reviewer.md` | Code review agent |
| `agents/agent-verify-app.md` | Quality gate agent |
| `agents/agent-git-guardian.md` | Git workflow agent |
| `agents/agent-security-auditor.md` | Security review agent |
| `agents/agent-doc-generator.md` | Documentation agent |
| `agents/agent-ai-engineer.md` | Vercel AI SDK agent |
| `agents/agent-nextjs-engineer.md` | Next.js specialist agent |
| `agents/agent-nestjs-engineer.md` | NestJS specialist agent |
| `agents/agent-spring-engineer.md` | Spring WebFlux agent |
| `agents/agent-drizzle-dba.md` | Drizzle ORM agent |
| `agents/agent-test-writer.md` | TDD specialist agent |
| `skills/project-execute/SKILL.md` | Full pipeline skill |
| `skills/project-init/SKILL.md` | Monorepo scaffolding |
| `skills/project-create-plan/SKILL.md` | Human planning skill |
| `skills/spec-planning/SKILL.md` | Automated planning |
| `skills/spec-epic-start/SKILL.md` | Epic execution entry |
| `skills/spec-prd-new/SKILL.md` | PRD discovery |
| `skills/spec-prd-parse/SKILL.md` | PRD to epic generator |
| `skills/spec-prd-list/SKILL.md` | PRD/epic status |
| `skills/spec-parse-ddd/SKILL.md` | DDD parser |
| `skills/spec-task-next/SKILL.md` | Next task finder |
| `skills/verify-all/SKILL.md` | Quality gate |
| `skills/test-and-fix/SKILL.md` | Iterative test fixing |
| `skills/security-scan/SKILL.md` | Security audit entry |
| `skills/analyze/SKILL.md` | Codebase analysis |
| `skills/systematic-debugging/SKILL.md` | Debugging methodology |
| `skills/diagnose-issue/SKILL.md` | Issue diagnosis |
| `skills/mode/SKILL.md` | Mode switcher |
| `skills/governance/SKILL.md` | Coding standards |
| `skills/governance-adr/SKILL.md` | ADR policy |
| `skills/session-start/SKILL.md` | Session initialization |
| `skills/session-end/SKILL.md` | Session completion |
| `skills/session-context-size/SKILL.md` | Context monitoring |
| `skills/git-status/SKILL.md` | Context loader |
| `skills/git-checkpoint/SKILL.md` | Save point creator |
| `skills/git-rollback/SKILL.md` | Checkpoint restore |
| `skills/git-quick-commit/SKILL.md` | WIP commit |
| `skills/git-commit-push-pr/SKILL.md` | Full git workflow |
| `skills/git-undo/SKILL.md` | Claude commit undo |
| `skills/github-issue/SKILL.md` | GitHub issue resolver |
| `skills/makefile-gen/SKILL.md` | Makefile generator |
| `skills/recreation.gov/SKILL.md` | Campground search |
| `skills/pattern-*.md` (9 files) | Framework pattern references |
| `skills/.system/skill-creator/SKILL.md` | Skill creation meta-skill |
| `skills/.system/skill-installer/SKILL.md` | Skill installation meta-skill |
