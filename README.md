# coding-agents-config

Shared configuration for AI coding agents (Claude Code and Codex). This repo is the
single source of truth for the **skills, agents, hooks, settings, and governance
rules** that drive an AI-augmented Software Development Lifecycle.

It packages two cooperating layers:

1. **App Factory SDLC** — a chain of `af-*` skills that take a project from intake
   worksheet to running backend code (PRD → DDD → DSL → plan → implementation → audit).
2. **Turn governance** — a strict, provenance-tracked, branch-protected workflow
   (`session → task → turn`) that wraps every coding prompt with auditable artifacts.

The repo is consumed by symlinking its directories into `~/.claude/` (Claude Code) and
`~/.codex/` (Codex), so a single `git pull` updates every machine.

---

## Quick start

```sh
git clone https://github.com/bobwares/coding-agents-config.git ~/coding-agents-config
cd ~/coding-agents-config
bash scripts/setup.sh        # creates symlinks, backs up any existing files
```

`setup.sh` links into three locations:

| Target dir        | Linked items |
|-------------------|--------------|
| `~/.claude/`      | `skills` `agents` `rules` `hooks` `context` `scripts` `plugins` `CLAUDE.md` `settings.json` |
| `~/.codex/`       | `agents` `AGENTS.md` |
| repo `./.claude/` | `CLAUDE.md` |

Verify:

```sh
ls -la ~/.claude/skills        # -> ~/coding-agents-config/skills
ls -la ~/.claude/CLAUDE.md     # -> ~/coding-agents-config/CLAUDE.md
ls -la ~/.claude/settings.json # -> ~/coding-agents-config/settings.json
```

Sync on any machine:

```sh
cd ~/coding-agents-config && git pull   # symlinks pick up changes immediately
```

---

## Repository layout

```text
coding-agents-config/
├── CLAUDE.md            # Global instructions for Claude Code (turn protocol, branch rules)
├── AGENTS.md            # Codex loader directive (loads CLAUDE.md)
├── settings.json        # Claude Code settings: model, env, permissions, hooks, plugins
├── package.json         # Node deps (caveman plugin)
│
├── skills/              # Skill definitions (one dir per skill, each with SKILL.md)
│   ├── af-*/            #   App Factory SDLC skills
│   ├── session-start/  #   Pipeline governance skills
│   ├── task-init/  task-close/
│   ├── turn-init/  turn-end/  branch-guard/
│   ├── eval-labeler/   #   Model-response evaluation
│   ├── .system/        #   Codex meta-skills (skill/plugin creators, docs, imagegen)
│   └── .nestjs/        #   Legacy NestJS/Prisma scaffolding skills
│
├── agents/             # Sub-agent definitions
│   └── agent-architecture-planner.md
│
├── hooks/              # Lifecycle hooks (shell)
│   └── branch-guard.sh # PreToolUse: auto-creates a task branch when on main/master
│
├── scripts/            # Automation
│   ├── setup.sh        #   Symlink installer
│   └── af-state.sh     #   .appfactory/memory/state.yaml CRUD helpers
│
├── .appfactory/        # Task/turn tracking + pipeline state (per consuming repo)
│   ├── tasks/          #   task-NNN/ with turns/turn-NNN/ artifacts
│   ├── tasks_index.csv #   Registry of all tasks
│   ├── specs/  prompts/  memory/  changelog.md
│
├── .github/            # PR + issue templates (epic, task, bug)
├── docs/               # Plans, migration analyses, quick-start guides
├── plugins/            # Plugin manager state (caveman, anthropic-agent-skills)
└── archive/            # Retired skills kept for reference (20 entries)
```

---

## Two-layer model

### Layer 1 — App Factory SDLC

The App Factory is the control plane for AI coding agents. `af-orchestrator` drives
nine SDLC steps; each step is a dedicated skill that reads/writes pipeline state in
`.appfactory/memory/state.yaml` (managed via `af-memory` / `scripts/af-state.sh`).

```text
1. Project Init      af-project-init     scaffold target project from a project YAML
2. PRD               af-be-prd-build     worksheet -> business-facing PRD
3. DDD               af-be-ddd-*         PRD -> Domain-Driven Design (build/analyze/refactor loop)
4. Tests             af-be-ddd-tests     DDD + PRD -> Gherkin BDD feature files
5. DSL               af-be-ddd-dsl       DDD -> backend DSL YAML
6. Plan              af-be-plan          DSL + tech-stack profile -> execution plan
7. Implementation    af-be-implementation copy tech stack + generate domain code
8. Audit             af-app-check        production-readiness review
```

#### DDD sub-loop (`af-be-ddd-orchestrator`)

```text
build ──> analyze ──> refactor? ──no──> tests
              ^            │yes
              └────────────┘   (bounded by max_ddd_tries = 3)
```

| Skill | Role |
|-------|------|
| `af-orchestrator` | Top-level SDLC coordinator |
| `af-project-init` | Export env + run init script to scaffold a new project |
| `af-be-prd-build` | Build PRD from an intake worksheet |
| `af-be-ddd-orchestrator` | Run DDD build → analyze → refactor loop → tests |
| `af-be-ddd-build` | Generate the DDD document (follows `ddd-template.md`) |
| `af-be-ddd-analysis` | Audit DDD quality, completeness, PRD alignment |
| `af-be-ddd-refactor` | Apply analysis findings back into the DDD |
| `af-be-ddd-tests` | Emit Gherkin BDD scenarios per aggregate |
| `af-be-ddd-dsl` | Convert DDD into backend DSL YAML |
| `af-be-plan` | DSL + tech profile → step-by-step execution plan |
| `af-be-implementation` | Copy tech-stack impl + generate domain code |
| `af-app-check` | Audit app for security/DB/deploy/code-quality readiness |
| `af-memory` | CRUD `state.yaml` to track pipeline progress |

### Layer 2 — Turn governance

`CLAUDE.md` enforces a session → task → turn protocol on **every** coding prompt.
The hard gate: **never write code on `main`/`master`.**

```text
prompt ──> session-start (first prompt only)
       ──> git branch --show-current
            ├─ on main/master ─> /task-init  (new task/TXXX branch + turn-001)
            └─ on task/TXXX    ─> /turn-init  (next turn-NNN)
       ──> execute user request
       ──> /turn-end           (always, even on failure)
       ──> /task-close          (when user says ready for review -> PR)
```

| Skill | When | Produces |
|-------|------|----------|
| `session-start` | First prompt of a session | Git state + context docs loaded, banner |
| `task-init` | On `main`/`master` | `task/TXXX` branch, task artifacts, `turn-001`, index row |
| `turn-init` | On a `task/TXXX` branch | Next `turn-NNN/` dir + `turn_context.md`, `execution_trace.json` |
| `turn-end` | After every prompt | `adr.md`, `manifest.json`, updated trace, commit |
| `task-close` | Task ready | Push branch, open PR vs `main`, finalize status |
| `branch-guard` | Helper | Creates a turn-scoped branch when on main (not model-invocable) |

**Tasks vs turns**

- A **task** is the branch-scoped unit of work that becomes one pull request. IDs are
  global, zero-padded: `001`, `002`, `003`. Branch format `task/TXXX`.
- A **turn** is one AI execution cycle within a task. IDs reset per task: `001`, `002`.

**Artifacts**

```text
.appfactory/tasks/task-NNN/
├── task_context.md  task_status.json  task_summary.md  pull_request.md
└── turns/turn-NNN/
    └── turn_context.md  execution_trace.json  adr.md  manifest.json
```

Every turn must produce exactly one `adr.md` (full or minimal). A row is appended to
`.appfactory/tasks_index.csv` per task and updated as status changes.

**Commit format**

```text
AI Coding Agent Change:
- <imperative bullet>
- <imperative bullet>
```

---

## Agents

| Agent | Model | Scope |
|-------|-------|-------|
| `agent-architecture-planner` | sonnet | Reads PRD/DDD/DSL + repo to produce architecture decisions, module maps, and task plans for downstream coding agents |

---

## Hooks

| Hook | Trigger | Behavior |
|------|---------|----------|
| `branch-guard.sh` | `PreToolUse(Bash/Write/Edit)` | If on `main`/`master`, auto-creates the next `task/TXXX` branch instead of blocking |

Wired in `settings.json` under `hooks.PreToolUse`.

---

## Settings (`settings.json`)

- **Model**: `opus` (env pins `ANTHROPIC_MODEL=claude-opus-4-5`, small/fast = sonnet-4-6).
- **Permissions**: broad `allow` for common dev tooling (git, gh, npm/pnpm, docker,
  java/maven/gradle, psql, coreutils); `ask` for `git push`/`git commit`/`sudo` and
  reading `.env`/`~/.ssh`; `deny` for destructive ops (`rm -rf /`, force-push to main,
  `npm/pnpm publish`).
- **Plugins enabled**: `document-skills` + `example-skills` (from `anthropics/skills`),
  `caveman` (compression mode).
- Status line, light theme, voice (hold mode).

---

## Meta-skills (`skills/.system`, Codex)

| Skill | Purpose |
|-------|---------|
| `skill-creator` | Scaffold/update a skill with a `SKILL.md` |
| `skill-installer` | Install Codex skills from a curated list or GitHub repo |
| `plugin-creator` | Create plugins + marketplace entries (`.codex-plugin/plugin.json`) |
| `openai-docs` | Up-to-date OpenAI docs with citations + model/upgrade guidance |
| `imagegen` | Generate/edit raster images |

`skills/.nestjs/` and `archive/` hold legacy/retired scaffolding skills kept for
reference; they are not part of the active pipeline.

---

## Adding a skill

```text
skills/my-skill/
└── SKILL.md      # frontmatter: name + description, then the procedure body
```

Use the `.system/skill-creator` meta-skill to scaffold one. Skills with
`disable-model-invocation: true` (e.g. `branch-guard`) are helpers invoked by other
skills, not directly by the model.

---

## Documentation

| Doc | Topic |
|-----|-------|
| `docs/QUICK_START.md` / `QUICK_START_CHECKLIST.md` | Onboarding walkthrough |
| `docs/appFactory-plan.md` | App Factory architecture and roadmap |
| `docs/comparison.md` | Approach comparison |
| `docs/migration-ai-to-appfactory.md` + `ai-to-appfactory-migration-analysis.md` | Migration notes |
| `docs/app-nextjs-nestjs-prisma.md` | Reference stack notes |
| `docs/skill-summary.md` | Skill catalog summary |
