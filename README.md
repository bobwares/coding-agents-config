# coding-agents-config

Agentic pipeline configuration for Claude Code and Codex. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules, plus an "App Factory" skill pipeline for DSL-driven backend generation.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it symlinks the repo into `~/.claude`, `~/.codex`, and a repo-local `./.claude`, backing up any existing files first:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
# Into ~/.claude/
ln -s ~/coding-agents-config/skills     ~/.claude/skills
ln -s ~/coding-agents-config/agents     ~/.claude/agents
ln -s ~/coding-agents-config/hooks      ~/.claude/hooks
ln -s ~/coding-agents-config/scripts    ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md  ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# Into ~/.codex/
ln -s ~/coding-agents-config/agents    ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# Repo-local mirror (so a Claude Code session started inside this repo also sees it)
ln -s ~/coding-agents-config/CLAUDE.md ~/coding-agents-config/.claude/CLAUDE.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).

`scripts/setup.sh` also links `rules/`, `context/`, and `plugins/` into `~/.claude/` for forward compatibility — those directories aren't present in this repo yet, so those particular symlinks are currently dangling until such directories are added.
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/AGENTS.md      # should point to ~/coding-agents-config/AGENTS.md
```

## Structure

```
coding-agents-config/
├── CLAUDE.md            # Global instructions — turn protocol, branch rules
├── AGENTS.md            # Codex loader directive → "read and load ~/.claude/CLAUDE.md"
├── settings.json        # Claude Code settings (model, permissions, hooks, plugins)
├── package.json         # npm dependency (caveman)
├── agents/              # Agent definitions
│   └── agent-architecture-planner.md
├── hooks/               # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh  # PreToolUse hook — auto-creates a task branch on main/master
├── skills/               # Slash-command skills
│   ├── session-start/    # Initialize session, load context docs
│   ├── task-init/        # Create task branch + task/turn-001 artifacts
│   ├── turn-init/        # Create the next turn's artifacts
│   ├── turn-end/         # Finalize a turn (ADR, manifest, trace)
│   ├── task-close/       # Finalize a task, push, open PR
│   ├── branch-guard/     # Create a turn branch if on main/master
│   ├── af-*/             # App Factory backend DDD pipeline (13 skills — PRD → DDD → DSL → plan → build → test)
│   ├── dsl-utils/, ui-utils/, unit-tests/, e2e-tests/  # DSL parsing, UI-DSL spec, test-sync, HTTP test artifacts
│   ├── eval-labeler/     # Label model-response evals
│   ├── .nestjs/          # NestJS + Prisma code-generation skills (8)
│   └── .system/          # Vendor skills bundled by Codex (skill-creator, skill-installer, imagegen, ...)
├── scripts/              # Automation scripts
│   ├── setup.sh          # Symlinks this repo into ~/.claude and ~/.codex
│   └── af-state.sh       # Read/write .appfactory/state.yaml
├── docs/                 # Reference and migration documentation
├── archive/               # Retired/legacy skill drafts kept for reference
├── .appfactory/           # Task/turn tracking, specs, prompts, memory
│   ├── tasks/             # Task branches with turns
│   ├── specs/
│   ├── prompts/
│   ├── memory/
│   ├── changelog.md
│   └── tasks_index.csv
└── .github/               # Issue and pull request templates
```

Note: earlier revisions of this README described a top-level `templates/` directory. That directory does not currently exist in the repo — `task-init` and `turn-init` each ship their own `templates/` subfolder, and older shared templates now live under `archive/templates/`.

## Execution Flow

The agentic pipeline enforces a strict turn-based workflow for all coding tasks:

```mermaid
flowchart TB
    subgraph SESSION["Session Lifecycle"]
        START([User Prompt]) --> SS{First prompt<br/>of session?}
        SS -->|Yes| SESSION_START["/session-start"]
        SS -->|No| TURN_INIT

        SESSION_START --> LOAD_GIT["Load Git State<br/>• git branch<br/>• git status<br/>• git log"]
        LOAD_GIT --> LOAD_CTX["Load Context Docs<br/>• adr-context.md<br/>• governance-context.md<br/>• tech-standards-context.md<br/>• turn-tracking-context.md"]
        LOAD_CTX --> BANNER["Display Session Banner"]
        BANNER --> TURN_INIT
    end

    subgraph TURN["Turn Lifecycle"]
        TURN_INIT["/turn-init"] --> RESOLVE_ID["Resolve TURN_ID<br/>get-next-turn-id.sh"]
        RESOLVE_ID --> CREATE_DIR["Create Turn Directory<br/>turns/turn-N/"]
        CREATE_DIR --> WRITE_CTX["Write turn_context.md"]
        WRITE_CTX --> WRITE_TRACE["Write execution_trace.json"]
        WRITE_TRACE --> TURN_BANNER["Display Turn Status"]
    end

    subgraph BRANCH_GATE["Branch Protection Gate"]
        TURN_BANNER --> CHECK_BRANCH["git branch --show-current"]
        CHECK_BRANCH --> IS_MAIN{On main<br/>or master?}
        IS_MAIN -->|Yes| HALT["HALT<br/>DO NOT WRITE CODE"]
        HALT --> BRANCH_GUARD["/branch-guard"]
        BRANCH_GUARD --> CREATE_BRANCH["git checkout -b<br/>turn/T{TURN_ID}"]
        CREATE_BRANCH --> VERIFY["Verify branch switched"]
        IS_MAIN -->|No| IS_TURN{On turn/T*<br/>branch?}
        IS_TURN -->|Yes| PROCEED["Proceed"]
        IS_TURN -->|No| WARN["Warn non-turn branch"]
        WARN --> PROCEED
        VERIFY --> PROCEED
    end

    subgraph EXECUTION["Task Execution"]
        PROCEED --> EXEC["Execute User Task"]
        EXEC --> ADD_HEADERS["Add Metadata Headers<br/>to all modified files"]
        ADD_HEADERS --> BUMP_VERSION["Bump File Versions<br/>SemVer"]
    end

    subgraph POST_EXEC["Post-Execution (/turn-end)"]
        BUMP_VERSION --> TURN_END["/turn-end"]
        TURN_END --> CAPTURE_GIT["Capture Git State"]
        CAPTURE_GIT --> UPDATE_CTX["Update turn_context.md<br/>• TURN_END_TIME<br/>• TURN_ELAPSED_TIME<br/>• SKILLS_EXECUTED<br/>• AGENTS_EXECUTED"]
        UPDATE_CTX --> UPDATE_TRACE["Update execution_trace.json"]
        UPDATE_TRACE --> WRITE_PR["Write pull_request.md"]
        WRITE_PR --> WRITE_ADR["Write adr.md<br/>Full or Minimal"]
        WRITE_ADR --> WRITE_MANIFEST["Write manifest.json<br/>SHA-256 checksums"]
        WRITE_MANIFEST --> UPDATE_INDEX["Update turns_index.csv"]
        UPDATE_INDEX --> TAG["git tag turn/{TURN_ID}"]
        TAG --> CHECK_UNCOMMITTED{Uncommitted<br/>changes?}
        CHECK_UNCOMMITTED -->|Yes| COMMIT["Commit with format:<br/>AI Coding Agent Change:"]
        CHECK_UNCOMMITTED -->|No| COMPLETE
        COMMIT --> COMPLETE["Turn Complete"]
    end

    subgraph ARTIFACTS["Turn Artifacts"]
        direction LR
        A1["turn_context.md"]
        A2["execution_trace.json"]
        A3["pull_request.md"]
        A4["adr.md"]
        A5["manifest.json"]
    end

    WRITE_CTX -.-> A1
    WRITE_TRACE -.-> A2
    WRITE_PR -.-> A3
    WRITE_ADR -.-> A4
    WRITE_MANIFEST -.-> A5
```

### Turn Protocol Summary

| Phase | Steps | Outputs |
|-------|-------|---------|
| **Session Start** | Load git state → Load 4 context docs → Display banner | Context loaded |
| **Task Init** (on `main`/`master`) | Resolve next task id → `git checkout -b task/TXXX` → Create task dir + turn-001 | `task_context.md`, `task_status.json`, `task_summary.md`, `pull_request.md`, turn-001 artifacts |
| **Turn Init** (on `task/TXXX`) | Resolve next turn id → Create dir → Write context + trace | `turn_context.md`, `execution_trace.json` |
| **Execution** | Execute task → Add headers → Bump versions | Modified files |
| **Turn End** | Update context → Write ADR → Write manifest → Update trace | `adr.md`, `manifest.json` |
| **Task Close** (on review) | Finalize task artifacts → push → open PR against `main` | Pull request |

## Skills

The `skills/` directory holds all slash-command skills. Skills live either directly under `skills/<name>/`, or nested one level under a namespace directory (`.nestjs/`, `.system/`, `dsl-utils/`, `ui-utils/`, `unit-tests/`, `e2e-tests/`).

### Governance — Turn Protocol

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context at the start of every session. |
| `task-init` | Initialize a new task branch (`task/TXXX`) and create task + turn-001 artifacts. Runs when on `main`/`master`. |
| `turn-init` | Initialize the next turn within the active task branch. |
| `turn-end` | Finalize the active turn (ADR, manifest, execution trace). Runs after every coding prompt. |
| `task-close` | Finalize the active task, push it, and open a pull request against `main`. |
| `branch-guard` | Create a turn-scoped branch (`turn/TNNN`) if on `main`/`master`. |

### App Factory — Backend DDD Pipeline (`af-*`)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrates the App Factory software development lifecycle end to end. |
| `af-project-init` | Export required environment variables and initialize an AppFactory project. |
| `af-memory` | CRUD operations against `.appfactory/state.yaml` for pipeline state tracking. |
| `af-be-prd-build` | Build a business-facing backend PRD from an intake worksheet. |
| `af-be-ddd-build` | Generate a backend Domain-Driven Design document from an approved PRD. |
| `af-be-ddd-dsl` | Generate a backend application DSL YAML from a DDD document. |
| `af-be-ddd-analysis` | Analyze a backend DDD/DSL for gaps or inconsistencies. |
| `af-be-ddd-refactor` | Refactor a backend DDD/DSL based on analysis findings. |
| `af-be-ddd-orchestrator` | Orchestrate the DDD build → analyze → refactor → test loop. |
| `af-be-ddd-tests` | Generate Gherkin BDD feature files from DDD and PRD specifications. |
| `af-be-plan` | Generate a backend execution plan from a domain DSL and tech-stack profile. |
| `af-be-implementation` | Copy the selected tech-stack implementation and generate domain code from the plan and BDD specs. |
| `af-app-check` | Audit an application for production readiness (security, database, deployment, code quality). |

### DSL, UI, and Test Utilities

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Parse and validate `app-dsl` YAML specifications before code generation. |
| `ui-utils/ui-implementation-language` | Declarative YAML standard for framework-neutral UI page/widget/form specs. |
| `unit-tests/test-implementation-sync` | Keep unit tests synchronized with actual service/DTO implementations. |
| `e2e-tests/http-test-artifacts` | Generate `.http` request files for REST endpoint testing. |
| `eval-labeler` | Process `Eval.md` files to generate structured notes and labeled model-response comparisons. |

### NestJS / Prisma Code Generation (`.nestjs/`)

| Skill | Description |
|-------|-------------|
| `app-from-dsl` | Orchestrates full-stack generation (entity, CRUD API, forms, tests) from `app-dsl` YAML. |
| `field-mapper-generator` | Generate field mapper/converter utilities between UI, API, and persistence layers. |
| `nestjs-crud-resource` | Generate a NestJS CRUD module (controller, service, DTOs) from a DSL backend spec. |
| `nestjs-prisma-resource` | Generate a full NestJS + Prisma CRUD resource from an input schema. |
| `nestjs-customer-crud-scaffold` | Non-interactive Nest CLI wrapper to scaffold a NestJS customer CRUD app. |
| `nestjs-observability` | Add structured logging, correlation IDs, and Prisma query logging to a NestJS backend. |
| `prisma/prisma-guidelines` | Prisma ORM development guidelines and constraints. |
| `prisma/prisma-persistence` | Generate Prisma schema and migrations from a DSL persistence model. |

### System (`.system/`)

Vendor skills bundled by Codex, not authored by this project: `skill-creator`, `skill-installer`, `imagegen`, `openai-docs`, `plugin-creator`.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse` (Bash / write tools) | Auto-creates a task branch instead of allowing edits directly on `main`/`master`. |

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
