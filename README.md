# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules, plus the App Factory (`af-*`) skill set for DSL-driven backend generation.

## Setup

### 1. Clone the repo

```sh
git clone <repo-url> ~/coding-agents-config
```

### 2. Create symlinks (automated)

Run the setup script — it symlinks the repo into `~/.claude/`, `~/.codex/`, and a repo-local `.claude/`, backing up any existing files:

```sh
bash scripts/setup.sh
```

<details>
<summary>Manual symlink commands</summary>

```sh
# ~/.claude/
ln -s ~/coding-agents-config/skills ~/.claude/skills
ln -s ~/coding-agents-config/agents ~/.claude/agents
ln -s ~/coding-agents-config/hooks ~/.claude/hooks
ln -s ~/coding-agents-config/scripts ~/.claude/scripts
ln -s ~/coding-agents-config/CLAUDE.md ~/.claude/CLAUDE.md
ln -s ~/coding-agents-config/settings.json ~/.claude/settings.json

# ~/.codex/
ln -s ~/coding-agents-config/agents ~/.codex/agents
ln -s ~/coding-agents-config/AGENTS.md ~/.codex/AGENTS.md

# repo-local ./.claude/
ln -s ~/coding-agents-config/CLAUDE.md ./.claude/CLAUDE.md
```

If any of these already exist, back them up first (`mv <target> <target>.bak`). `scripts/setup.sh` also attempts `rules/`, `context/`, and `plugins/` under `~/.claude/` for forward compatibility; these directories don't exist in the repo yet, so those links are skipped/dangling until added.

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
├── CLAUDE.md           # Global instructions — turn protocol, branch rules
├── AGENTS.md           # Agent loader directive (Codex)
├── settings.json       # Claude Code settings (model, permissions, hooks)
├── package.json        # Repo-level npm dependency (caveman)
├── agents/             # Agent definitions (e.g. agent-architecture-planner.md)
├── hooks/              # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh # Auto-creates task/T{NNN} branch when on main/master
├── skills/             # Slash-command skills
│   ├── .system/        # Meta-skills (skill-creator, skill-installer, plugin-creator, ...)
│   ├── session-start/  # Initialize session context
│   ├── task-init/      # Create a new task branch + turn-001 artifacts
│   ├── task-close/     # Finalize task, push branch, open PR
│   ├── turn-init/      # Create the next turn directory and artifacts
│   ├── turn-end/       # Finalize turn with ADR and manifest
│   ├── branch-guard/   # Create a turn-scoped branch if on main/master
│   ├── af-*/           # App Factory skills (project init, PRD/DDD pipeline, build, checks)
│   └── ...             # dsl-utils/, e2e-tests/, ui-utils/, unit-tests/ (sub-skill groups)
├── scripts/             # Automation scripts
│   ├── setup.sh         # Creates the symlinks above
│   └── af-state.sh      # Helper used by af-memory to read/write .appfactory state
├── .appfactory/         # Task/turn tracking, specs, prompts, and memory
│   ├── tasks/           # task-XXX/ directories with turns/turn-XXX/ artifacts
│   ├── tasks_index.csv  # Registry of all tasks (branch, status, PR, turn count)
│   ├── changelog.md     # Project changelog
│   ├── specs/           # Specifications
│   ├── prompts/         # Prompt drafts and notes
│   └── memory/          # Project memory (state.yaml, etc.)
├── .github/             # Issue templates and PR template
├── docs/                # Reference documentation (migration notes, plans, skill summary)
└── archive/             # Retired skills and templates kept for reference
```

## Execution Flow

The agentic pipeline enforces a strict task/turn workflow for all coding tasks:

```mermaid
flowchart TB
    subgraph SESSION["Session Lifecycle"]
        START([User Prompt]) --> SS{First prompt<br/>of session?}
        SS -->|Yes| SESSION_START["/session-start"]
        SS -->|No| BRANCH_CHECK
        SESSION_START --> LOAD_GIT["Load Git State<br/>• git branch<br/>• git status<br/>• git log"]
        LOAD_GIT --> LOAD_CTX["Load Context Docs<br/>• adr-context.md<br/>• governance-context.md<br/>• tech-standards-context.md<br/>• turn-tracking-context.md"]
        LOAD_CTX --> BANNER["Display Session Banner"]
        BANNER --> BRANCH_CHECK
    end

    subgraph BRANCH_GATE["Branch Gate"]
        BRANCH_CHECK["git branch --show-current"] --> IS_MAIN{On main<br/>or master?}
        IS_MAIN -->|Yes| TASK_INIT["/task-init<br/>create task/T{NNN}<br/>+ task artifacts<br/>+ turn-001"]
        IS_MAIN -->|No| IS_TASK{On task/T{NNN}<br/>branch?}
        IS_TASK -->|Yes| TURN_INIT["/turn-init<br/>create next turn-N<br/>under active task"]
        IS_TASK -->|No| PROCEED["Proceed as-is<br/>(non-task branch)"]
        TASK_INIT --> PROCEED
        TURN_INIT --> PROCEED
    end

    subgraph EXECUTION["Task Execution"]
        PROCEED --> EXEC["Execute User Task"]
    end

    subgraph POST_EXEC["Post-Execution (/turn-end)"]
        EXEC --> TURN_END["/turn-end"]
        TURN_END --> UPDATE_CTX["Update turn_context.md<br/>• TURN_END_TIME<br/>• TURN_ELAPSED_TIME<br/>• SKILLS_EXECUTED<br/>• AGENTS_EXECUTED"]
        UPDATE_CTX --> WRITE_ADR["Write adr.md<br/>Full or Minimal"]
        WRITE_ADR --> WRITE_MANIFEST["Write manifest.json"]
        WRITE_MANIFEST --> UPDATE_TRACE["Update execution_trace.json"]
        UPDATE_TRACE --> COMMIT["Commit with format:<br/>AI Coding Agent Change:"]
        COMMIT --> COMPLETE["Turn Complete — Task stays open"]
    end

    subgraph CLOSE["/task-close (on explicit request)"]
        COMPLETE -.-> TASK_CLOSE["/task-close"]
        TASK_CLOSE --> PUSH["Push task branch"]
        PUSH --> PR["Open pull request against main"]
    end

    subgraph ARTIFACTS["Turn Artifacts"]
        direction LR
        A1["turn_context.md"]
        A2["execution_trace.json"]
        A3["adr.md"]
        A4["manifest.json"]
    end

    UPDATE_CTX -.-> A1
    UPDATE_TRACE -.-> A2
    WRITE_ADR -.-> A3
    WRITE_MANIFEST -.-> A4
```

### Turn Protocol Summary

| Phase | Trigger | Outputs |
|-------|---------|---------|
| **Session Start** | First prompt of the session | Git state + 4 context docs loaded, session banner |
| **Task Init** | Current branch is `main`/`master` | `task/T{NNN}` branch, task artifacts, `turn-001` |
| **Turn Init** | Current branch is `task/T{NNN}` | Next `turn-N` directory, `turn_context.md`, `execution_trace.json` |
| **Execution** | Every coding prompt | Modified files |
| **Turn End** | After every execution, even on failure | `adr.md`, `manifest.json`, updated `turn_context.md`/`execution_trace.json` |
| **Task Close** | User signals the task is ready for review | Pushed branch, opened pull request against `main` |

## Skills

### Pipeline lifecycle

| Skill | Description |
|-------|-------------|
| `session-start` | Load repository state and core pipeline context at the start of a session |
| `task-init` | Initialize a new task branch and create task + turn-001 artifacts (run on `main`/`master`) |
| `turn-init` | Initialize the next turn within the active task branch |
| `turn-end` | Finalize the active turn (ADR, manifest, execution trace) after every execution |
| `task-close` | Finalize the active task branch, push it, and open a pull request against `main` |
| `branch-guard` | Create a turn-scoped branch if currently on `main`/`master` |

### App Factory — project & PRD

| Skill | Description |
|-------|-------------|
| `af-orchestrator` | Orchestrate the App Factory software development lifecycle |
| `af-project-init` | Orchestrate AppFactory project initialization by exporting required env vars and invoking the helper script |
| `af-memory` | CRUD operations for AppFactory pipeline state (`state.yaml` in `.appfactory/`) |
| `af-app-check` | Audit an application for production readiness (security, database, deployment, code quality) |
| `af-be-prd-build` | Build a business-facing backend PRD from an intake worksheet or discovery notes |

### App Factory — backend DDD pipeline

| Skill | Description |
|-------|-------------|
| `af-be-ddd-orchestrator` | Orchestrate the backend DDD workflow through build, analyze, refactor loop, and test phases |
| `af-be-ddd-build` | Generate a backend DDD document from an approved PRD |
| `af-be-ddd-analysis` | Audit a generated DDD spec for quality, completeness, and PRD alignment |
| `af-be-ddd-refactor` | Apply targeted patches to a DDD spec from `af-be-ddd-analysis` findings |
| `af-be-ddd-dsl` | Generate a backend application DSL YAML document from a DDD document |
| `af-be-ddd-tests` | Generate Gherkin-style BDD feature files from DDD and PRD specifications |

### App Factory — backend delivery

| Skill | Description |
|-------|-------------|
| `af-be-plan` | Generate a backend execution plan from a domain DSL YAML and a tech-stack profile |
| `af-be-implementation` | Copy the selected tech-stack implementation and generate domain code from the plan + BDD specs |

### Utility skill groups

| Group | Sub-skill | Description |
|-------|-----------|--------------|
| `dsl-utils/` | `dsl-model-interpreter` | Interpret DSL model definitions |
| `e2e-tests/` | `http-test-artifacts` | Generate HTTP end-to-end test artifacts |
| `ui-utils/` | `ui-implementation-language` | UI implementation language helpers |
| `unit-tests/` | `test-implementation-sync` | Keep unit tests in sync with implementation |
| — | `eval-labeler` | Label Eval.md model-response comparisons (Response A vs B) for coding tasks |

### Meta-skills (`.system/`)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create new skills with a `SKILL.md` |
| `skill-installer` | Install skills from marketplaces |
| `plugin-creator` | Scaffold new Claude Code plugins |
| `imagegen` | Image generation helper |
| `openai-docs` | OpenAI/Codex documentation reference |

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse(Bash)` | Auto-creates `task/T{NNN}` and checks out into it when the active branch is `main`/`master` |

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
