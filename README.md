# coding-agents-config

Agentic pipeline configuration for Claude Code and Codex. Provides the **AppFactory**
skill library — a spec-driven AI SDLC pipeline for generating backend applications —
plus a Task/Turn governance protocol with provenance tracking, branch protection, and
audit artifacts.

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
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

ln -s ~/coding-agents-config/agents ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).
See `scripts/setup.sh` for the complete, authoritative list of symlinked paths.
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/agents        # should point to ~/coding-agents-config/agents
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/AGENTS.md      # should point to ~/coding-agents-config/AGENTS.md
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Governance: Task/Turn protocol, branch rules, ADR rules, AppFactory constants
├── AGENTS.md           # Codex loader directive -> reads ~/.claude/CLAUDE.md
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── package.json        # npm dependencies (e.g. caveman plugin)
├── hooks/
│   └── branch-guard.sh # PreToolUse hook: auto-creates task/TXXX branch off main/master
├── skills/              # Slash-command skills
│   ├── af-*/            # AppFactory SDLC pipeline (orchestrator + 12 phase skills)
│   ├── session-start/   # Task/Turn lifecycle skills
│   ├── task-init/
│   ├── turn-init/
│   ├── turn-end/
│   ├── task-close/
│   ├── branch-guard/
│   ├── dsl-utils/, e2e-tests/, ui-utils/, unit-tests/, eval-labeler/  # Cross-cutting utilities
│   ├── .nestjs/         # NestJS/Prisma code-generation skills
│   └── .system/         # Meta-skills (skill-creator, skill-installer, plugin-creator, ...)
├── agents/
│   └── agent-architecture-planner.md  # Architecture/planning subagent
├── scripts/
│   ├── setup.sh         # Create symlinks into ~/.claude and ~/.codex
│   └── af-state.sh      # AppFactory pipeline state helper
├── docs/                # Reference docs (AppFactory plan, migration notes, skill summary)
├── archive/             # Retired pre-AppFactory skill library, kept for reference
├── .appfactory/         # Task/turn tracking, specs, prompts, memory
│   ├── tasks/task-XXX/turns/turn-XXX/  # Per-task and per-turn artifacts
│   ├── specs/, prompts/, memory/
│   ├── tasks_index.csv
│   └── changelog.md
└── .github/             # Issue and PR templates
```

## Governance: Task/Turn Protocol

Every coding session follows the protocol defined in [`CLAUDE.md`](CLAUDE.md):

1. **First prompt of the session** → `/session-start` loads git state and pipeline context.
2. **On `main`/`master`** → `/task-init` resolves the next `task/TXXX` id, creates and
   switches to that branch, and scaffolds `turn-001`. The `branch-guard.sh` hook also
   auto-creates this branch if a write is attempted while on `main`/`master`.
3. **On a `task/TXXX` branch** → `/turn-init` scaffolds the next `turn-NNN`.
4. **Execute the user's request.**
5. **Always** → `/turn-end`, even on failure.
6. **When the task is ready for review** → `/task-close` finalizes the task, pushes the
   branch, and opens a pull request against `main`.

| Level | Required artifacts | Location |
|-------|--------------------|----------|
| Task | `task_context.md`, `task_status.json`, `task_summary.md`, `pull_request.md` | `.appfactory/tasks/task-XXX/` |
| Turn | `turn_context.md`, `execution_trace.json`, `adr.md`, `manifest.json` | `.appfactory/tasks/task-XXX/turns/turn-XXX/` |

Commit messages use the `AI Coding Agent Change:` bullet format (see `CLAUDE.md`).
`CLAUDE.md` also defines the AppFactory container constants (`AF_ROOT`,
`AF_GITHUB_PROFILE`, `AF_GENERATED_PROJECT_ROOT`, `AF_TECH_STACK_DSL`,
`AF_TECH_STACK_IMPLEMENTATIONS`, `max_ddd_tries`) used by the `af-*` skills.

## Skills

### AppFactory SDLC Pipeline (`af-*`)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrates the App Factory software development lifecycle end to end |
| `af-project-init` | Bootstraps a new generated project by exporting AppFactory env vars and running the init script |
| `af-be-prd-build` | Builds a business-facing backend PRD from an intake worksheet or discovery notes |
| `af-be-ddd-orchestrator` | Runs the backend DDD build → analyze → refactor loop, then triggers test generation |
| `af-be-ddd-build` | Generates the backend Domain-Driven Design document from an approved PRD |
| `af-be-ddd-analysis` | Audits a DDD specification for quality, completeness, and PRD alignment |
| `af-be-ddd-refactor` | Applies targeted patches to a DDD spec based on analysis findings |
| `af-be-ddd-dsl` | Generates the backend DSL YAML from the DDD document |
| `af-be-ddd-tests` | Generates Gherkin/BDD feature files from the DDD and PRD |
| `af-be-plan` | Generates a step-by-step backend execution plan from the DSL and a tech-stack profile |
| `af-be-implementation` | Generates backend code from the execution plan, DSL, and BDD specs into a tech-stack implementation |
| `af-app-check` | Audits a generated application for production readiness (security, database, deployment, code quality) |
| `af-memory` | CRUD operations on AppFactory pipeline state for cross-skill context |

### Session & Task/Turn Lifecycle

| Skill | Description |
|-------|-------------|
| `session-start` | Loads git state and pipeline context at the start of every session |
| `task-init` | Creates a new `task/TXXX` branch and scaffolds task + turn-001 artifacts (run on `main`/`master`) |
| `turn-init` | Scaffolds the next `turn-NNN` inside the active task branch |
| `turn-end` | Finalizes the active turn's artifacts after execution (always run, even on failure) |
| `task-close` | Finalizes the task branch, pushes it, and opens a pull request against `main` |
| `branch-guard` | Creates a `turn/T{ID}`-scoped branch if still on `main`/`master` |

### NestJS / Prisma Code Generation (`skills/.nestjs/`)

| Skill | Description |
|-------|-------------|
| `app-from-dsl` | Orchestrates full-stack generation (entity, CRUD API, forms, tests) from app-dsl YAML |
| `nestjs-crud-resource` | Generates a NestJS CRUD module (controller, service, DTOs) from a DSL backend spec |
| `nestjs-prisma-resource` | Generates a full NestJS + Prisma CRUD resource from an input schema |
| `nestjs-customer-crud-scaffold` | Scaffolds a NestJS app and customer CRUD module via the Nest CLI |
| `nestjs-observability` | Adds structured logging, correlation IDs, and observability to a NestJS/Prisma backend |
| `field-mapper-generator` | Generates field mapper/converter utilities between UI, API, and persistence layers |
| `prisma/prisma-persistence` | Generates Prisma schema and migrations from a DSL persistence model |
| `prisma/prisma-guidelines` | Prisma development guidelines and anti-pattern reference |

### Cross-Cutting Utilities

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Parses and validates app-dsl YAML (models, mappers, pages, backends, lookups) |
| `e2e-tests/http-test-artifacts` | Generates `.http` request files for REST endpoint testing |
| `ui-utils/ui-implementation-language` | Declarative YAML standard for UI pages, layouts, forms, and bindings |
| `unit-tests/test-implementation-sync` | Keeps unit tests synchronized with actual service/DTO implementations |
| `eval-labeler` | Labels and scores Response A vs Response B model outputs for coding-task evals |

### Meta-Skills (`skills/.system/`)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Guide for creating or updating `SKILL.md`-based skills |
| `skill-installer` | Installs skills into `$CODEX_HOME/skills` from a curated list or a GitHub repo |
| `plugin-creator` | Scaffolds Codex plugin directories and marketplace entries |
| `imagegen` | Generates or edits raster image assets |
| `openai-docs` | Looks up official OpenAI API/product documentation with citations |

## Agents

| Agent | Description |
|-------|-------------|
| `agent-architecture-planner` | Reads the PRD, DDD, DSL, and repo structure to produce architecture decisions, module maps, and task plans for downstream coding agents |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse (Bash/Write/Edit) | Auto-creates and switches to the next `task/TXXX` branch if still on `main`/`master` |

## `.appfactory/` — Task & Turn Tracking

```
.appfactory/
├── tasks/
│   └── task-XXX/
│       ├── task_context.md
│       ├── task_status.json
│       ├── task_summary.md
│       ├── pull_request.md
│       └── turns/turn-XXX/{turn_context.md,execution_trace.json,adr.md,manifest.json}
├── specs/        # Specifications
├── prompts/      # Prompt history and templates
├── memory/       # Project memory
├── tasks_index.csv
└── changelog.md
```

## Docs

| Doc | Purpose |
|-----|---------|
| `appFactory-plan.md` | AppFactory implementation plan and architecture |
| `migration-ai-to-appfactory.md` | Migration plan from `ai/agentic-pipeline/` to `.appfactory/` |
| `ai-to-appfactory-migration-analysis.md` | Analysis backing the migration |
| `skill-summary.md` | AppFactory skill pipeline reference table |
| `app-nextjs-nestjs-prisma.md` | Reference tech stack documentation |

## Archive

`archive/` holds the pre-AppFactory skill library (DSL-first full-stack generation
skills, templates, and analysis docs), retained for reference. Active skills live
under `skills/`.

## Adding a new skill

Each skill lives in its own directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

The `.system/skill-creator` meta-skill can guide you through creating one — invoke it
from Claude Code.

## Syncing across machines

Since this is a standard git repo, pull on any machine to stay current:

```sh
cd ~/coding-agents-config && git pull
```

The symlinks mean changes are picked up immediately — no reinstall needed.
