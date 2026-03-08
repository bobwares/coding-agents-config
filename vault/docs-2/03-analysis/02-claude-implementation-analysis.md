# Analysis: .claude implementation

## Overview

This analysis reviewed your `.claude` runtime configuration, hooks, skills, and supporting documentation to identify what is currently broken, inconsistent, or unnecessary. The highest-risk issues are in hook wiring and naming drift after recent renames (`execute` -> `project-execute`, `adr` -> `governance-adr`, and context/memory removals).

Operationally, your system is close to usable, but a few hard failures prevent expected behavior: Bash audit logging does not run, skill-eval receives empty input in practice, and multiple references still point to removed paths/files. There is also substantial doc/runtime drift that increases cognitive load and causes false guidance.

## Key Findings

1. PreToolUse Bash audit hook is misconfigured due to a typoed script path.
2. UserPromptSubmit skill-eval wiring uses stdin, but wrapper script forwards `$1`, causing likely empty analysis input.
3. SessionStart checks `.claude/context/*.md`, but that directory is missing in this repo.
4. Skill naming and invocation references are inconsistent (`/execute` vs `/project-execute`; `name: ddd-parse` in `spec-parse-ddd`).
5. Docs still reference removed components (`memory-bank` agent, `.claude/skills/execute/SKILL.md`).
6. Several files appear redundant/stale after migrations and should be archived or corrected.

## Files Examined

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Hook/permission runtime source of truth |
| `.claude/hooks/skill-eval.sh` | Skill-eval shell wrapper |
| `.claude/hooks/skill-eval.js` | Skill-eval scoring engine |
| `.claude/hooks/turn-init.sh` | Turn directory/bootstrap logic |
| `.claude/hooks/audit-log.sh` | Bash command audit logger |
| `.claude/hooks/skill-rules.json` | Skill suggestion triggers and mappings |
| `.claude/skills/session-start/SKILL.md` | Session-start behavior contract |
| `.claude/skills/session-end/SKILL.md` | Session-end artifact contract |
| `.claude/skills/project-execute/SKILL.md` | Main pipeline skill (renamed execute) |
| `.claude/skills/project-create-plan/SKILL.md` | Planning-only skill contract |
| `.claude/skills/spec-parse-ddd/SKILL.md` | DDD parser naming/outputs |
| `.claude/skills/project-init/SKILL.md` | Scaffolding integration references |
| `docs/skills.md` | Human skill registry docs |
| `docs/agents.md` | Human agent registry docs |
| `docs/hooks.md` | Hook behavior docs |
| `README.md` | Top-level user guidance |
| `docs/update-context.md` | Context strategy doc with legacy references |

## Issues Identified

1. `HIGH` Broken Bash audit hook path
: `settings.json` invokes `wraudit-log.sh`, but only `audit-log.sh` exists.
: Evidence: `.claude/settings.json:108`, `.claude/hooks/audit-log.sh:1`.
: Impact: Bash commands are not audited as intended.

2. `HIGH` skill-eval input mismatch (stdin vs `$1`)
: Hook pipes prompt to stdin (`echo "$CLAUDE_USER_PROMPT" | ... skill-eval.sh`), but wrapper sends `$1` to node.
: Evidence: `.claude/settings.json:86`, `.claude/hooks/skill-eval.sh:17`.
: Impact: auto skill suggestions are likely empty/incorrect.

3. `HIGH` Context loading contract points to missing directory
: SessionStart checks `.claude/context/*.md`; directory is absent.
: Evidence: `.claude/settings.json:70`; local check: `.claude/context` missing.
: Impact: claimed context preload is not happening.

4. `MEDIUM` Execute skill rename drift
: Runtime skill is `project-execute`, but docs and internal references still heavily use `/execute` and old file paths.
: Evidence: `.claude/skills/project-execute/SKILL.md:2`, `docs/skills.md:9`, `docs/skills.md:141`.
: Impact: user/operator confusion; potential invocation failures depending on dispatcher behavior.

5. `MEDIUM` Removed memory-bank still documented
: `memory-bank` appears in docs but agent file is missing.
: Evidence: `docs/agents.md:22`, `docs/agents.md:41`; `.claude/agents/agent-memory-bank.md` missing.
: Impact: stale guidance and misrouted expectations.

6. `MEDIUM` DDD skill naming inconsistency
: File path is `spec-parse-ddd`, skill name is `ddd-parse`.
: Evidence: `.claude/skills/spec-parse-ddd/SKILL.md:2`.
: Impact: ambiguity in invocation/docs; integration mismatch risk.

7. `LOW` Session-end references absent context ADR path
: Session-end says ADR policy in `.claude/context/context_adr.md`, but context directory is missing.
: Evidence: `.claude/skills/session-end/SKILL.md:53`.
: Impact: guidance inconsistency; no direct runtime failure.

8. `LOW` Legacy context-prime references in docs
: Context optimization docs still reference `/context-prime` despite removal/rename history.
: Evidence: `docs/update-context.md:30`, `docs/update-context.md:49`.
: Impact: unnecessary confusion.

## Recommendations

1. Fix hard hook failures first:
: Update `.claude/settings.json` Bash PreToolUse command to call `.claude/hooks/audit-log.sh`.
: Update `skill-eval.sh` to read stdin (or update hook to pass argument directly) so prompt text reaches `skill-eval.js`.

2. Decide and enforce one canonical execute command:
: Either keep `/project-execute` and rewrite docs/examples, or alias `/execute` explicitly and document aliasing.
: Remove/replace all references to `.claude/skills/execute/SKILL.md`.

3. Resolve context source-of-truth mismatch:
: Either restore `.claude/context/*.md` files or update SessionStart + docs to use the actual files you want loaded.

4. Remove stale memory-bank references:
: Update `docs/agents.md`, `docs/skills.md`, and any templates mentioning `memory-bank`.

5. Normalize DDD naming:
: Align file path/invocation/frontmatter for `spec-parse-ddd` vs `ddd-parse`.

6. Add an automated consistency check (recommended):
: Script to validate referenced files exist, hook paths are valid, and docs do not reference removed skills/agents.

## Appendix

### Immediate one-line fixes (conceptual)

- Audit hook path:
  - from: `bash "$(pwd)/.claude/hooks/wraudit-log.sh"`
  - to: `bash "$(pwd)/.claude/hooks/audit-log.sh"`

- skill-eval wrapper:
  - from: `echo "$1" | node "$NODE_SCRIPT"`
  - to: `cat - | node "$NODE_SCRIPT"`

### Execution note

The `analyze` skill requests spawning an isolated `Explore` subagent. That subagent tool was not available in this environment, so the analysis was executed locally with the same skill structure and output contract.

---
Generated: 2026-02-26T19:20:18Z
Analyzed by: Local agent (Explore-equivalent workflow)
