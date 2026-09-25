# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces a task/turn-based
workflow with provenance tracking, branch protection, and governance rules,
plus the App Factory (`af-*`) skill set for building backend applications
end-to-end from a PRD.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it creates all symlinks and backs up any existing files:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
# ~/.claude/
ln -s ~/coding-agents-config/skills       ~/.claude/skills
ln -s ~/coding-agents-config/agents       ~/.claude/agents
ln -s ~/coding-agents-config/hooks        ~/.claude/hooks
ln -s ~/coding-agents-config/scripts      ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md    ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# ~/.codex/
ln -s ~/coding-agents-config/agents    ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# repo-local ./.claude/
ln -s ~/coding-agents-config/CLAUDE.md ./.claude/CLAUDE.md
```

`scripts/setup.sh` also attempts to link `rules/`, `context/`, and `plugins/`
into `~/.claude/` if those directories exist in the repo. If any target
already exists, it's backed up first (`mv <target> <target>.bak`).
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md            # Global instructions — task/turn protocol, branch rules
├── AGENTS.md            # Codex loader directive (reads ~/.claude/CLAUDE.md)
├── settings.json        # Claude Code settings (model, permissions, hooks, plugins)
├── package.json         # Repo-level npm deps (e.g. caveman plugin)
├── hooks/               # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh  # PreToolUse: auto-creates task/TXXX when on main/master
├── agents/              # Standalone agent prompt definitions
│   └── agent-architecture-planner.md
├── skills/              # Slash-command / auto-invoked skills
│   ├── session-start/   # Load repo state + governance context (first prompt)
│   ├── task-init/       # Create task branch + task/turn-001 artifacts
│   ├── turn-init/       # Initialize the next turn in the active task
│   ├── turn-end/        # Finalize a turn (ADR, manifest, trace, commit)
│   ├── task-close/      # Finalize task, push branch, open PR
│   ├── branch-guard/    # Manual branch-guard invocation
│   ├── af-*/            # App Factory backend SDLC pipeline (see below)
│   ├── dsl-utils/, ui-utils/, e2e-tests/, unit-tests/  # Utility skill groups
│   ├── eval-labeler/    # Label/compare model response evals
│   ├── .system/         # Meta-skills (skill-creator, skill-installer, ...)
│   └── .nestjs/         # NestJS/Prisma scaffolding skills (hidden group)
├── .appfactory/         # Task/turn tracking, specs, prompts, memory
│   ├── tasks/           # task-XXX/ with turns/turn-XXX/ artifacts
│   ├── tasks_index.csv  # Registry of all tasks and their PR status
│   ├── specs/           # Specifications
│   ├── prompts/         # Prompt drafts and templates
│   ├── memory/          # Project memory
│   └── changelog.md
├── archive/             # Retired/superseded skills and templates, kept for reference
├── docs/                # Reference documentation (migration notes, plans, skill summary)
└── scripts/             # Automation scripts
    ├── setup.sh         # Creates the symlinks above
    └── af-state.sh      # Read/write .appfactory/state.yaml
```

Note: templates now live alongside the skill that owns them
(e.g. `skills/task-init/templates/`, `skills/af-be-plan/templates/`) rather
than in a shared top-level `templates/` directory.

## Execution Flow

The pipeline enforces a task/turn workflow for all coding prompts:

1. **First prompt of the session** → invoke `session-start`: loads git state
   (`git branch`, `git status`, `git log`) and the governance/ADR/tech-standards/
   turn-tracking context docs, then prints a session banner.
2. **Every coding prompt** → check the current branch:
   - On `main`/`master` → invoke `task-init`. This resolves the next
     zero-padded task id, creates and checks out `task/TXXX`, and initializes
     `.appfactory/tasks/task-XXX/` plus `turn-001`. The `branch-guard.sh` hook
     also auto-creates a `task/TXXX` branch as a safety net if a write/bash
     tool call happens while still on `main`/`master`.
   - On `task/TXXX` (or `task/TXXX-*`) → invoke `turn-init`, which resolves
     the next turn id and creates `turns/turn-XXX/` with an initial
     `turn_context.md`.
3. **Execute the user's request.**
4. **Always** invoke `turn-end`, even on failure — it finalizes
   `turn_context.md`, writes `execution_trace.json`, `adr.md` (full or
   minimal), and `manifest.json`, updates the turn/task registries, and
   commits with the `AI Coding Agent Change:` format.
5. **When the user signals the task is ready for review** → invoke
   `task-close`, which updates `task_status.json` / `task_summary.md` /
   `pull_request.md`, pushes the task branch, and opens a pull request
   against `main`.

**Hard gate:** code is never written on `main` or `master` — `task-init`
(or the `branch-guard.sh` hook) must move the session onto a `task/TXXX`
branch first.

### Required Turn Artifacts

Every turn produces, under `.appfactory/tasks/task-XXX/turns/turn-XXX/`:

- `turn_context.md`
- `execution_trace.json`
- `adr.md`
- `manifest.json`

### Required Task Artifacts

Every task produces, under `.appfactory/tasks/task-XXX/`:

- `task_context.md`
- `task_status.json`
- `task_summary.md`
- `pull_request.md`

### Registries

- `.appfactory/tasks_index.csv` — one row per task, updated as status changes
- `.appfactory/tasks/task-XXX/turns_index.csv` — optional per-task turn log

## Skills

### Governance / Pipeline Control

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context; run at session start |
| `task-init` | Initialize a new task branch and create task + turn-001 artifacts (run on `main`/`master`) |
| `turn-init` | Initialize the next turn within the active task branch |
| `turn-end` | Finalize the active turn after execution, even on failure |
| `task-close` | Finalize the active task branch, push it, and open a PR against `main` |
| `branch-guard` | Check current branch and create a turn-scoped branch if on `main`/`master` |

### App Factory Backend SDLC (`af-*`)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrates the App Factory software development lifecycle end to end |
| `af-project-init` | Bootstraps a new App Factory project (env vars + init script) |
| `af-memory` | CRUD for AppFactory pipeline state (`state.yaml`) across skills |
| `af-be-prd-build` | Builds a business-facing backend PRD from an intake worksheet |
| `af-be-ddd-build` | Generates a backend Domain-Driven Design doc from an approved PRD |
| `af-be-ddd-analysis` | Audits a generated DDD spec for quality, completeness, and PRD alignment |
| `af-be-ddd-refactor` | Applies `af-be-ddd-analysis` findings back into the DDD spec |
| `af-be-ddd-orchestrator` | Orchestrates the DDD build → analyze → refactor → test loop |
| `af-be-ddd-dsl` | Generates a backend application DSL (YAML) from the DDD document |
| `af-be-ddd-tests` | Generates Gherkin BDD feature files from the DDD + PRD specs |
| `af-be-plan` | Generates a step-by-step backend execution plan from the DSL + tech stack |
| `af-be-implementation` | Executes backend code generation from the plan, tech stack, and BDD specs |
| `af-app-check` | Audits an application for production readiness (security, DB, deploy, quality) |

### Utility Groups

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Parse and validate app-dsl YAML specs before code generation |
| `ui-utils/ui-implementation-language` | Declarative YAML standard for UI pages, widgets, forms, and bindings |
| `e2e-tests/http-test-artifacts` | Generate `.http` files for REST client endpoint testing |
| `unit-tests/test-implementation-sync` | Keep unit tests synchronized with service/DTO implementations |
| `eval-labeler` | Label/score/compare model responses (Response A vs B) from run directories |

### Meta-Skills (`.system/`)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create new skills with a `SKILL.md` |
| `skill-installer` | Install skills from marketplaces |
| `plugin-creator` | Scaffold new Claude Code plugins |
| `imagegen` | Image generation helper skill |
| `openai-docs` | OpenAI/Codex documentation reference |

### NestJS/Prisma Scaffolding (`.nestjs/`, hidden group)

| Skill | Description |
|-------|-------------|
| `nestjs-customer-crud-scaffold` | Scaffold a NestJS customer CRUD app |
| `nestjs-prisma-resource` | Generate a NestJS CRUD resource backed by Prisma |
| `nestjs-crud-resource` | Generate a generic NestJS CRUD resource |
| `nestjs-observability` | Add logging/metrics/tracing scaffolding to a NestJS service |
| `field-mapper-generator` | Generate field-mapping code between DTOs/entities |
| `app-from-dsl` | Generate a NestJS app from an app-dsl specification |
| `prisma/prisma-guidelines`, `prisma/prisma-persistence` | Prisma schema and persistence-layer guidance |

### Archived Skills

Superseded skills (`schema-to-database`, `code-entity-to-crud`,
`nestjs-observability` predecessors, legacy turn-only templates, etc.) are
kept under `archive/` for reference rather than deleted — see
`archive/README.md` and `archive/SUMMARY.md`.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse` (write/bash tools) | Auto-create the next `task/TXXX` branch if still on `main`/`master` |

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

The `.system/skill-creator` meta-skill can guide you through creating one — invoke it from Claude Code.

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
