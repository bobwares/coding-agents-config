# Context: Conventions — Naming, Templating, Git, and Formatting Standards

> **Load trigger**: Loaded by `/governance` skill only. Not loaded at session start.

## Purpose

Single source of truth for all naming conventions, file layout, variable syntax, branching, commits, and formatting rules used across the agentic-pipeline.

---

## Variable Syntax

| Syntax | Type | Resolved | Use For |
|--------|------|----------|---------|
| `${VAR}` | Early-bound | Session start — once, stable | Paths, identities, fixed config |
| `{{VAR}}` | Late-bound | Template render time — per-turn | Turn IDs, dates, dynamic content |

---

## File Naming Conventions

| File Type | Pattern | Example |
|-----------|---------|---------|
| Context files | `context_<name>.md` (lowercase, underscores) | `context_governance.md` |
| Skill packages | `<name>/SKILL.md` (lowercase, hyphens) | `governance/SKILL.md` |
| Agent files | `<name>.md` (lowercase, hyphens) | `nextjs-engineer.md` |
| Template files | `<name>_template.md` or `<name>.md` | `adr_template.md` |
| Turn artifacts | `session_context.md`, `pull_request.md`, `adr.md`, `manifest.json` | fixed names |
| Turn directories | `turn-${TURN_ID}` | `turn-42` |
| Design documents | `{{agent}}/{{agent}}-{{filename}}.md` (hyphens, agent directory) | `claude/claude-task-service-design.md` |

---

## Directory Structure

```
project-root/
├── ai/
│   ├── agentic-pipeline/              # Pipeline runtime artifacts
│   │   ├── turns_index.csv            # Turn registry
│   │   └── turns/
│   │       ├── turn-1/
│   │       │   ├── session_context.md
│   │       │   ├── pull_request.md
│   │       │   ├── adr.md
│   │       │   └── manifest.json
│   │       └── turn-N/
│   └── context/
│       └── project_context.md         # Project identity
├── claude/                            # Claude agent design docs
├── apps/                              # Application source code
├── packages/                          # Shared packages
└── .claude/                           # Pipeline configuration
    ├── agents/
    ├── skills/
    ├── context/
    ├── hooks/
    ├── memory/
    ├── rules/
    └── templates/
```

---

## Agent Identity and Directory Isolation

Every agent must declare its identity. Claude agents may only write to the `./claude/` design directory.

| Rule | Detail |
|------|--------|
| Claude identity | `CODING_AGENT=claude` |
| Claude design directory | `./claude/` only |
| Never write to | `./codex/` |
| Every design doc must declare | `Agent: claude` in front matter or header |

---

## Turn Artifact Conventions

Every turn **must** produce exactly these four artifacts in `./ai/agentic-pipeline/turns/turn-${TURN_ID}/`:

| Artifact | Required | Notes |
|----------|----------|-------|
| `session_context.md` | ✅ | Table of all loaded context variables |
| `pull_request.md` | ✅ | Summary of all changes made |
| `adr.md` | ✅ | Full ADR or minimal one-line entry |
| `manifest.json` | ✅ | SHA-256 hashes of all output files |

---

## Git Conventions

### Branch Naming

Format: `<type>/<short-description>[-<task-id>]`

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

```
feat/task-assignment-service-T42
fix/sprint-date-validation-T99
refactor/user-repository-pattern
chore/update-drizzle-deps
```

### Commit Messages

```
AI Coding Agent Change:
- Implement TaskAssignmentService with domain validation
- Emit TaskAssigned event on assignee change
- Write 14 unit tests for assignment rules
- Add integration test for concurrent assignment
- Document repository pattern decision in ADR turn-3
```

Rules:
- Start with `AI Coding Agent Change:`
- 3–5 imperative bullet points
- Reference TURN_ID when an ADR was written

### Tags

After every turn: `git tag turn/${TURN_ID} && git push origin turn/${TURN_ID}`

---

## Formatting Standards

### Markdown

- ATX headers (`#`, `##`, `###`) — never setext underlines
- Blank line between all sections
- Fenced code blocks with language identifiers (` ```typescript `)
- Tables aligned with pipes
- No trailing whitespace

### JSON

- 2-space indentation
- Trailing newline at end of file
- Keys in camelCase
- No trailing commas

### TypeScript / JavaScript

- ESLint + Prettier enforced (via PostToolUse hook)
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types
- Explicit return types on public functions

### Java

- Checkstyle with Google style guide
- Javadoc on all public methods and classes
- No wildcard imports

### Python

- Ruff for linting
- Black for formatting
- Type hints on all functions

---

## Skill vs Context: Usage Guide

| Concept | Role | Contains |
|---------|------|---------|
| **Context file** | Policy — *what* must be done | Rules, requirements, standards, decision matrices |
| **Skill file** | Capability — *how* to do it | Step-by-step procedures, templates, implementation details |

Context files are loaded by the session-start hook. Skills are invoked by the orchestrator when the relevant task type is detected.
