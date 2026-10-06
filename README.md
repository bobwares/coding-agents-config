# coding-agents-config

Agentic pipeline configuration for Claude Code (and Codex). Enforces a task/turn workflow with provenance tracking, branch protection, and governance rules, and ships the App Factory (`af-*`) skills for generating backend applications from a PRD.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

```sh
bash scripts/setup.sh
```

The script creates symlinks (backing up any existing files as `*.bak`) for:

| Destination | Items |
|-------------|-------|
| `~/.claude/` | `skills`, `agents`, `rules`, `hooks`, `context`, `scripts`, `plugins`, `CLAUDE.md`, `settings.json` |
| `~/.codex/` | `agents`, `AGENTS.md` |
| `./.claude/` (repo-local) | `CLAUDE.md` |

Items that do not exist in the repo are skipped.

### 3. Verify

```sh
ls -la ~/.claude/skills ~/.claude/hooks ~/.claude/agents ~/.claude/CLAUDE.md ~/.claude/settings.json
```

Each should point into `~/coding-agents-config`.

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions: task/turn protocol, branch rules
├── AGENTS.md           # Loader directive for Codex-style agents
├── settings.json       # Claude Code settings (models, permissions, hooks, status line)
├── agents/             # Subagents (agent-architecture-planner)
├── hooks/
│   └── branch-guard.sh # PreToolUse hook: blocks writes on main/master
├── skills/             # Active skills (see below)
├── scripts/
│   ├── setup.sh        # Symlink installer
│   └── af-state.sh     # Helpers for .appfactory/memory/state.yaml
├── docs/               # Plans, migration notes, skill summary
├── archive/            # Retired skills, templates, and legacy turns
└── .appfactory/        # Task/turn tracking, specs, prompts, memory
```

## Execution Flow

Work is organized into **tasks** (one branch, one pull request) made of **turns** (one AI execution cycle).

1. **First prompt of a session:** `/session-start`.
2. **Every coding prompt:** check the current branch.
   - On `main`/`master`: `/task-init` creates the next `task/TXXX` branch, initializes `.appfactory/tasks/task-XXX/` and `turn-001`.
   - On `task/TXXX*`: `/turn-init` creates the next turn.
3. **Execute** the request. Writing code on `main`/`master` is never allowed.
4. **Always `/turn-end`**, even on failure: finalizes artifacts and commits with `AI Coding Agent Change:`.
5. **When ready for review:** `/task-close` pushes the branch and opens a pull request against `main`.

### Artifacts

```
.appfactory/
├── tasks_index.csv
└── tasks/task-001/
    ├── task_context.md  task_status.json  task_summary.md  pull_request.md
    └── turns/turn-001/
        └── turn_context.md  execution_trace.json  adr.md  manifest.json
```

IDs are zero-padded to three digits. Task ids are global; turn ids reset per task. Every turn produces exactly one `adr.md` (full or minimal).

## Skills

### Pipeline control

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context |
| `task-init` | Create the task branch and task/turn-001 artifacts |
| `turn-init` | Initialize the next turn in the active task |
| `turn-end` | Finalize the turn (ADR, manifest, trace, commit) |
| `task-close` | Push the task branch and open a pull request |
| `branch-guard` | Create a branch if on main/master |

### App Factory

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrate the App Factory SDLC end to end |
| `af-project-init` | Initialize an AppFactory project |
| `af-memory` | Read/write pipeline state in `.appfactory/memory/state.yaml` |
| `af-be-prd-build` | Build a PRD from a completed worksheet |
| `af-be-ddd-build` | Generate the Domain-Driven Design document from a PRD |
| `af-be-ddd-analysis` | Analyze a DDD document |
| `af-be-ddd-refactor` | Refactor a DDD document from analysis findings |
| `af-be-ddd-orchestrator` | Run build, analyze, refactor loop (max 3 tries), then tests |
| `af-be-ddd-tests` | Generate Gherkin BDD feature files from DDD and PRD |
| `af-be-ddd-dsl` | Generate the backend application DSL YAML from the DDD |
| `af-be-plan` | Build an execution plan from the DSL and a tech stack profile |
| `af-be-implementation` | Generate the backend from the plan and BDD specs |
| `af-app-check` | Production-readiness audit (security, database, deployment, quality) |

### Utilities

| Skill | Description |
|-------|-------------|
| `dsl-utils`, `ui-utils` | DSL and UI helper resources |
| `unit-tests`, `e2e-tests` | Test helper resources |
| `eval-labeler` | Label and compare model responses from `Eval.md` files |

Retired skills (e.g. NestJS/Prisma scaffolding, `schema-to-database`) live in `archive/`.

## Agents

| Agent | Description |
|-------|-------------|
| `agent-architecture-planner` | Reads PRD, DDD, DSL, and repo structure to produce architecture decisions, module maps, and task plans |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse (Bash) | Block writes on main/master |

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` that has `name` and `description` frontmatter:

```
skills/my-skill/
└── SKILL.md
```

## Syncing across machines

```sh
cd ~/coding-agents-config && git pull
```

Symlinks pick up changes immediately; no reinstall needed.
