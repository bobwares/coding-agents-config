# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script. It creates all symlinks and backs up any existing files:

```sh
bash scripts/setup.sh
```

It links the following:

| Destination | Items |
|-------------|-------|
| `~/.claude/` | `skills`, `agents`, `rules`, `hooks`, `context`, `scripts`, `plugins`, `CLAUDE.md`, `settings.json` |
| `~/.codex/` | `agents`, `AGENTS.md` |
| `./.claude/` (repo-local) | `CLAUDE.md` |

Items that do not exist in the repo are skipped. Existing files are backed up as `<target>.bak`.

### 3. Verify

```sh
ls -la ~/.claude/skills        # -> ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # -> ~/coding-agents-config/hooks
ls -la ~/.claude/CLAUDE.md     # -> ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # -> ~/coding-agents-config/settings.json
```

## Structure

```
coding-agents-config/
├── CLAUDE.md           # Global instructions: task/turn protocol, branch rules
├── AGENTS.md           # Agent loader directive (points at ~/.claude/CLAUDE.md)
├── settings.json       # Claude Code settings (model, permissions, hooks, plugins)
├── agents/             # Subagent definitions
│   └── agent-architecture-planner.md
├── hooks/
│   └── branch-guard.sh # PreToolUse hook: auto-creates a task branch if on main/master
├── skills/             # Slash-command skills (see below)
├── scripts/
│   ├── setup.sh        # Symlink installer
│   └── af-state.sh     # AppFactory state helpers (state.yaml)
├── docs/               # Reference docs and migration notes
├── archive/            # Retired skills and legacy turn records
├── .github/            # PR template and issue templates (bug, epic, task)
└── .appfactory/        # Task/turn tracking
    ├── tasks/          # task-XXX/ with task artifacts and turns/turn-XXX/
    ├── tasks_index.csv # Registry of tasks
    ├── specs/          # Specifications
    ├── prompts/        # Prompt templates
    ├── memory/         # Project memory
    └── changelog.md
```

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
        HALT --> TASK_INIT["/task-init"]
        TASK_INIT --> CREATE_BRANCH["git checkout -b<br/>task/TXXX"]
        CREATE_BRANCH --> VERIFY["Verify branch switched"]
        IS_MAIN -->|No| IS_TASK{On task/T*<br/>branch?}
        IS_TASK -->|Yes| PROCEED["Proceed"]
        IS_TASK -->|No| WARN["Warn non-task branch"]
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
        UPDATE_INDEX --> TAG["git tag task/TXXX"]
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
| **Turn Init** | Resolve ID → Create dir → Write context + trace | `turn_context.md`, `execution_trace.json` |
| **Branch Gate** | Check branch → HALT if main → Create turn branch | Safe branch |
| **Execution** | Execute task → Add headers → Bump versions | Modified files |
| **Turn End** | Update context → Write PR → ADR → Manifest → Index → Tag | 5 artifacts complete |

## Skills

### Pipeline control

| Skill | Description |
|-------|-------------|
| `session-start` | Load repo state and core pipeline context (first prompt of a session) |
| `task-init` | Create `task/TXXX` branch, task artifacts and `turn-001` (when on main/master) |
| `turn-init` | Initialize the next turn within the active task |
| `turn-end` | Finalize the turn: context, trace, ADR, manifest, commit |
| `task-close` | Finalize the task branch, push, and open a pull request |
| `branch-guard` | Check the branch and create a task branch if on main/master |

### AppFactory backend pipeline

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrate the App Factory SDLC |
| `af-project-init` | Initialize an AppFactory project |
| `af-memory` | Read/write pipeline state in `.appfactory/memory/state.yaml` |
| `af-be-prd-build` | Build a business-facing PRD |
| `af-be-ddd-build` | Generate a Domain-Driven Design document from a PRD |
| `af-be-ddd-analysis` | Analyze the DDD document |
| `af-be-ddd-refactor` | Refactor the DDD document from analysis findings |
| `af-be-ddd-dsl` | Generate a domain DSL YAML from the DDD document |
| `af-be-ddd-tests` | Generate Gherkin BDD feature files from DDD and PRD |
| `af-be-ddd-orchestrator` | Run build, analyze, refactor loop (max 3 tries), then tests |
| `af-be-plan` | Generate an execution plan from a DSL and tech stack profile |
| `af-be-implementation` | Copy a tech stack implementation and generate the app |
| `af-app-check` | Audit production readiness (security, database, deployment, quality) |

### Utilities

| Skill | Description |
|-------|-------------|
| `dsl-utils/dsl-model-interpreter` | Interpret DSL models |
| `ui-utils/ui-implementation-language` | UI implementation language helpers |
| `unit-tests/test-implementation-sync` | Keep tests in sync with implementation |
| `e2e-tests/http-test-artifacts` | HTTP test artifacts |
| `eval-labeler` | Label and evaluate Eval.md model responses |

### Meta-skills (`skills/.system`)

`skill-creator`, `skill-installer`, `plugin-creator`, `imagegen`, `openai-docs`

Retired skills (NestJS/Prisma scaffolding, schema-to-database, etc.) live in `archive/`.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | PreToolUse(Bash) | Auto-create a task branch when on main/master instead of writing there |

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
