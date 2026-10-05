# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces a task/turn workflow with provenance tracking, branch protection, and governance rules, and ships the App Factory (`af-*`) skills for generating backend applications from PRDs.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it symlinks `skills agents rules hooks context scripts plugins CLAUDE.md settings.json` into `~/.claude/`, `agents AGENTS.md` into `~/.codex/`, and `CLAUDE.md` into the repo-local `.claude/`. Existing files are backed up to `*.bak`:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json
```

If any of these already exist, back them up first (`mv <target> <target>.bak`).
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/agents        # should point to ~/coding-agents-config/agents
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions — task/turn protocol, branch rules
├── AGENTS.md           # Agent loader directive
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── agents/             # Subagent definitions
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # Auto-creates a task branch when on main/master
├── skills/             # Slash-command skills (lifecycle, af-*, utilities)
│   └── .system/        # Meta-skills (skill-creator, skill-installer, ...)
├── scripts/            # setup.sh, af-state.sh
├── .appfactory/        # Task/turn tracking, prompts, specs, memory
│   ├── tasks/          # task-XXX/ with turns/turn-XXX/
│   ├── tasks_index.csv # Task registry
│   ├── specs/
│   ├── prompts/
│   └── memory/
├── archive/            # Retired skills and legacy turn records
├── docs/               # Reference documentation
└── .github/            # PR and issue templates
```

## Execution Flow

Every coding prompt runs inside a **task** (a `task/TXXX` branch that becomes one pull request) made of **turns** (one AI execution cycle each). See `CLAUDE.md` for the full rules. The diagram below shows the turn lifecycle; branch handling is `/task-init` on `main`/`master` and `/turn-init` on `task/TXXX*` branches.

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
        HALT --> BRANCH_GUARD["/task-init"]
        BRANCH_GUARD --> CREATE_BRANCH["git checkout -b<br/>task/TXXX"]
        CREATE_BRANCH --> VERIFY["Verify branch switched"]
        IS_MAIN -->|No| IS_TURN{On task/T*<br/>branch?}
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

### Task / Turn Protocol Summary

| Phase | Steps | Outputs |
|-------|-------|---------|
| **Session Start** | First prompt only: load git state → load context docs → display banner | Context loaded |
| **Task Init** (on `main`/`master`) | Resolve next task id → create `task/TXXX` → init task + `turn-001` → append `tasks_index.csv` | Task branch, task artifacts |
| **Turn Init** (on `task/TXXX*`) | Resolve next turn id → write context + trace | `turn_context.md`, `execution_trace.json` |
| **Execution** | Execute task → add headers → bump versions | Modified files |
| **Turn End** | Update context/trace → ADR → manifest → index → commit (`AI Coding Agent Change:`) | `adr.md`, `manifest.json` |
| **Task Close** | On explicit request: finalize task, push branch, open PR against `main` | `task_summary.md`, `pull_request.md` |

Hard gate: never write code or commit on `main`/`master`. `/turn-end` always runs, even on failure.

Artifacts live under `.appfactory/tasks/task-XXX/` (`task_context.md`, `task_status.json`, `task_summary.md`, `pull_request.md`) and `.appfactory/tasks/task-XXX/turns/turn-XXX/` (`turn_context.md`, `execution_trace.json`, `adr.md`, `manifest.json`).

## Skills

### Pipeline lifecycle

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context |
| `task-init` | Create `task/TXXX` branch plus task and `turn-001` artifacts |
| `task-close` | Finalize the task branch, push, and open a PR against `main` |
| `turn-init` | Initialize the next turn within the active task |
| `turn-end` | Finalize the turn (ADR, manifest, trace, commit) |
| `branch-guard` | Check the branch and create a task/turn branch if on main/master |

### App Factory (`af-*`)

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrate the App Factory SDLC |
| `af-project-init` | Initialize an AppFactory project and its environment |
| `af-memory` | CRUD for pipeline state (`.appfactory/memory/state.yaml`) |
| `af-be-prd-build` | Build a business-facing PRD |
| `af-be-ddd-build` | Generate the Domain-Driven Design document from a PRD |
| `af-be-ddd-analysis` | Analyze the DDD document |
| `af-be-ddd-refactor` | Refactor the DDD document from analysis findings |
| `af-be-ddd-orchestrator` | Run the DDD build → analyze → refactor loop, then tests |
| `af-be-ddd-dsl` | Generate the backend application DSL (YAML) from the DDD |
| `af-be-ddd-tests` | Generate Gherkin BDD scenarios from the DDD and PRD |
| `af-be-plan` | Generate the execution plan from the DSL and a tech stack profile |
| `af-be-implementation` | Generate the app by copying a tech stack implementation to the target |
| `af-app-check` | Audit an app for production readiness |

### Utility

| Skill | Description |
|-------|-------------|
| `dsl-utils`, `ui-utils` | DSL and UI helper utilities |
| `unit-tests`, `e2e-tests` | Test generation helpers |
| `eval-labeler` | Label model response evaluations from `Eval.md` files |

### Meta-skills (`skills/.system`)

`skill-creator`, `skill-installer`, `plugin-creator`, `imagegen`, `openai-docs`.

Retired skills (nestjs/prisma scaffolding, schema-to-database, etc.) are kept in `archive/`.

## Agents

| Agent | Purpose |
|-------|---------|
| `agent-architecture-planner` | Reads PRD, DDD, DSL, and repo to produce architecture decisions, module maps, and task plans |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup.sh` | Create symlinks into `~/.claude/` and `~/.codex/` |
| `scripts/af-state.sh` | Source-able helpers for reading/writing AppFactory `state.yaml` |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse(Bash) | On `main`/`master`, auto-create the next `task/TXXX` branch instead of allowing writes |

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
