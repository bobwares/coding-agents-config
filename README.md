# coding-agents-config

Agentic pipeline configuration for Claude Code. Enforces turn-based workflow with provenance tracking, branch protection, and governance rules.

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

It links three target sets:

- **`~/.claude/`** (Claude Code): `skills`, `agents`, `rules`, `hooks`, `context`, `scripts`, `plugins`, `CLAUDE.md`, `settings.json`
- **`~/.codex/`** (Codex): `agents`, `AGENTS.md`
- **`<repo>/.claude/`** (repo-local): `CLAUDE.md`

> `rules`, `context`, and `plugins` are reserved symlink targets for future use — they don't exist in this repo yet, so `bash scripts/setup.sh` will create dangling symlinks for them until those directories are added.

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
</details>

### 3. Verify

```sh
ls -la ~/.claude/skills        # should point to ~/coding-agents-config/skills
ls -la ~/.claude/hooks         # should point to ~/coding-agents-config/hooks
ls -la ~/.claude/scripts       # should point to ~/coding-agents-config/scripts
ls -la ~/.claude/CLAUDE.md     # should point to ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # should point to ~/coding-agents-config/settings.json
ls -la ~/.codex/AGENTS.md      # should point to ~/coding-agents-config/AGENTS.md
```

## Structure

```
coding-agents-config/
├── CLAUDE.md            # Global instructions — turn protocol, branch rules
├── AGENTS.md            # Agent loader directive
├── settings.json        # Claude Code settings (model, permissions, hooks)
├── package.json         # npm metadata (caveman dependency for skill installs)
├── hooks/                # Shell hooks triggered by Claude Code events
│   └── branch-guard.sh   # Auto-creates a task branch when on main/master
├── skills/               # Slash-command skills (see Skills below)
│   ├── .system/          # Meta-skills (skill-creator, skill-installer, plugin-creator, imagegen, openai-docs)
│   ├── session-start/    # Initialize session context
│   ├── task-init/        # Initialize a new task branch + turn-001 artifacts
│   ├── turn-init/        # Create the next turn directory and initial artifacts
│   ├── turn-end/         # Finalize turn with PR, ADR, manifest
│   ├── task-close/       # Finalize task branch, push, open PR
│   ├── branch-guard/     # Create turn branch if on main/master
│   ├── af-*/             # App Factory (af) SDLC pipeline skills — see below
│   ├── dsl-utils/        # DSL parsing/interpretation skills
│   ├── e2e-tests/        # End-to-end/HTTP test artifact skills
│   ├── ui-utils/         # UI implementation language skills
│   └── unit-tests/       # Test/implementation sync skills
├── agents/              # Standalone agent definitions
│   └── agent-architecture-planner.md
├── scripts/             # Automation scripts
│   ├── setup.sh         # Creates the ~/.claude symlinks
│   └── af-state.sh      # AppFactory pipeline state helper
├── .appfactory/         # Task/turn tracking and specs
│   ├── tasks/           # Task branches with turns
│   ├── specs/           # Specifications
│   ├── prompts/         # Prompt templates
│   ├── memory/          # Project memory
│   ├── tasks_index.csv  # Task registry
│   └── changelog.md     # Project changelog
├── archive/             # Retired skills and templates kept for reference
└── docs/                # Reference documentation
```

Note: templates (ADR, pull request, manifest schema, etc.) are bundled per-skill under each skill's own `templates/` directory (e.g. `skills/task-init/templates/`, `skills/turn-init/templates/`) rather than in a shared top-level `templates/` folder.

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
| **Turn Init** | Resolve ID → Create dir → Write context + trace | `turn_context.md`, `execution_trace.json` |
| **Branch Gate** | Check branch → HALT if main → Create turn branch | Safe branch |
| **Execution** | Execute task → Add headers → Bump versions | Modified files |
| **Turn End** | Update context → Write PR → ADR → Manifest → Index → Tag | 5 artifacts complete |

## Skills (24 + 5 meta-skills)

| Category | Skill | Description |
|----------|-------|-------------|
| **Session** | `session-start` | Load repository state and core pipeline context. Run at the start of every Claude Code session. |
| **Task** | `task-init` | Initialize a new task branch and create task plus turn-001 artifacts. Run when current branch is main or master. |
| | `task-close` | Finalize the active task branch, push it, and open a pull request against main. |
| **Turn** | `turn-init` | Initialize the next turn within the active task branch. Run when already on a task branch. |
| | `turn-end` | Finalize the active turn after execution. Run after every coding prompt, even on failure. |
| | `branch-guard` | Check current git branch and create a turn-scoped branch if on main or master. |
| **App Factory — Backend DDD** | `af-be-ddd-build` | Generate a backend Domain-Driven Design document from an approved PRD. |
| | `af-be-ddd-analysis` | Audit a generated DDD spec for quality, completeness, and PRD alignment. |
| | `af-be-ddd-refactor` | Refactor a DDD spec using `af-be-ddd-analysis` findings while preserving structure and intent. |
| | `af-be-ddd-dsl` | Generate a backend application DSL YAML document from a DDD document. |
| | `af-be-ddd-tests` | Generate Gherkin-style BDD scenarios from DDD and PRD specifications. |
| | `af-be-ddd-orchestrator` | Orchestrate the backend DDD workflow through build, analyze, refactor loop, and test phases. |
| **App Factory — Backend Build** | `af-be-prd-build` | Build a business-facing PRD for a backend application/service/module. |
| | `af-be-plan` | Generate a backend execution plan from a domain DSL and a tech stack profile. |
| | `af-be-implementation` | Execute backend generation by copying a tech stack implementation and generating domain code. |
| **App Factory — Pipeline** | `af-orchestrator` | Orchestrate the full App Factory Software Development Lifecycle. |
| | `af-project-init` | Orchestrate AppFactory project initialization by exporting required env vars and invoking the helper script. |
| | `af-memory` | CRUD operations for AppFactory pipeline state management (`state.yaml` in `.appfactory/`). |
| | `af-app-check` | Audit an application for production readiness (security, database, deployment, code quality). |
| **DSL** | `dsl-utils/dsl-model-interpreter` | Parse and validate app-dsl YAML specifications before code generation. |
| **UI** | `ui-utils/ui-implementation-language` | Declarative YAML language standard for UI pages, layouts, widgets, forms, and API interactions. |
| **Testing** | `unit-tests/test-implementation-sync` | Keep generated unit tests synchronized with actual service/DTO implementations. |
| | `e2e-tests/http-test-artifacts` | Generate `.http` request files for REST endpoint testing. |
| **Evaluation** | `eval-labeler` | Process `Eval.md` files to label and compare model responses (Response A vs B) for coding tasks. |

### Meta-Skills (.system)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create new skills with SKILL.md |
| `skill-installer` | Install skills into `$CODEX_HOME/skills` from a curated list or a GitHub repo |
| `plugin-creator` | Scaffold plugin directories with `.codex-plugin/plugin.json` and marketplace entries |
| `imagegen` | Generate or edit raster images (photos, illustrations, textures, mockups) |
| `openai-docs` | Look up official OpenAI API/product documentation with citations |

Each skill lives in its own directory under `skills/` (or nested one level under a category directory like `dsl-utils/`, `ui-utils/`, `unit-tests/`, `e2e-tests/`) with a `SKILL.md` file describing when Claude should invoke it.

## Templates

There is no shared top-level `templates/` directory. Instead:

- **Active templates** ship inside the `templates/` subdirectory of the skill that consumes them, e.g. `skills/task-init/templates/{task_context.md,turn_context.md}`, `skills/turn-init/templates/turn_context.md`, `skills/af-be-ddd-build/templates/ddd-template.md`, `skills/af-be-ddd-dsl/templates/domain-dsl-template.yaml`, `skills/af-be-ddd-tests/templates/{feature-template.gherkin,gherkin-spec-template.md}`, `skills/af-be-plan/templates/execution-plan-template.md`, `skills/af-be-implementation/templates/implementation-manifest-template.yaml`, `skills/af-be-prd-build/templates/prd-template.md`, and `skills/af-project-init/templates/{README.md,gitignore.template}`.
- **Retired templates** from an earlier turn-protocol design (`adr_template.md`, `pull_request_template.md`, `manifest.schema.json`, `metadata_header.txt`, `branch_naming.md`, `commit_message.md`, `tech-stack.template.md`) are preserved under `archive/templates/` for reference.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `branch-guard.sh` | `PreToolUse(Bash)` | Auto-creates a `task/T<NNN>` branch when the current branch is `main` or `master`, instead of blocking the tool call |

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
