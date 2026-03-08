# Analysis: codebase

## Overview
This repository is a shared configuration and workflow toolkit for Claude Code and Codex, centered on skills, agents, hooks, and turn-lifecycle artifacts. The design intent is clear: enforce governance, standardize execution, and preserve provenance for every turn.

The implementation is mostly coherent, but operational consistency is currently the main risk. Lifecycle requirements are strict in docs and skills, yet the artifact history shows partial execution for most turns. There are also portability gaps where runtime assumptions differ between environments.

## Key Findings
1. Turn-lifecycle completion is inconsistent: only `turn-4`, `turn-13`, and `turn-14` have full post-execution artifacts, while most historical turns are incomplete.
2. Session-start context loading is fragile when a local `./.claude` directory exists but does not contain context files.
3. A few skills encode runtime-specific assumptions (`Task`/Explore, hard-coded home path) that reduce cross-machine reliability.
4. Governance controls are present and explicit (branch protection, post-execution requirements), but current working patterns show drift from those controls.

## Files Examined
| File | Purpose |
|------|---------|
| `README.md` | Repo purpose, setup flow, and structure |
| `CLAUDE.md` | Global turn-lifecycle and artifact requirements |
| `settings.json` | Permission model and hook orchestration |
| `hooks/turn-init.sh` | Turn directory + execution trace/session context initialization |
| `hooks/skill-eval.sh` | Prompt-time skill suggestion wrapper |
| `hooks/skill-eval.js` | Skill matching engine and scoring |
| `scripts/setup.sh` | Symlink bootstrap for `~/.claude`, `~/.codex`, and local `.claude` |
| `scripts/get-current-turn-id.sh` | Current turn resolver |
| `scripts/get-next-turn-id.sh` | Next turn id allocator |
| `skills/analyze/SKILL.md` | Analysis skill contract |
| `skills/session-end/SKILL.md` | Post-execution lifecycle completion contract |
| `skills/human-review/SKILL.md` | Human review/next-turn planning workflow |
| `ai/agentic-pipeline/turns_index.csv` | Turn index ledger |
| `ai/agentic-pipeline/turns/turn-*/` | Actual artifact completeness across turns |

## Issues Identified
1. **HIGH**: Turn provenance is incomplete for most recorded turns.
   - Evidence: `turn-1..3,5..12` contain only `session_context.md` + `execution_trace.json`, missing `pull_request.md`, `adr.md`, and `manifest.json`.
   - Evidence: `ai/agentic-pipeline/turns_index.csv` has sparse coverage relative to existing turn directories.
   - Impact: auditability, traceability, and governance claims are undermined.

2. **MEDIUM**: SessionStart hook picks `./.claude` based on directory existence, not required file presence.
   - Evidence: `settings.json:72` sets `CLAUDE_PLUGIN_ROOT="$(pwd)/.claude"; [ -d "$CLAUDE_PLUGIN_ROOT" ] || ...` then checks `context/*.md` there.
   - Repo state includes local `.claude` without context files, which causes false-missing context reporting.
   - Impact: operator confusion and potentially degraded startup context behavior.

3. **MEDIUM**: Skill contracts include runtime-specific assumptions that are not universally portable.
   - Evidence: `skills/analyze/SKILL.md:34-39` requires `Task(subagent_type: "Explore", model: "sonnet")`.
   - Evidence: `skills/human-review/SKILL.md:20` falls back to `"$HOME/coding-agents-config/scripts/get-current-turn-id.sh"` (machine-specific path).
   - Impact: reduced reliability outside the author’s exact environment.

4. **LOW**: Session-end tagging/push step is unconditional in the skill text.
   - Evidence: `skills/session-end/SKILL.md:95-97` always instructs `git push origin turn/${TURN_ID}`.
   - Impact: local-only repos or disconnected remotes can fail end-of-turn flow unless manually adapted.

5. **LOW**: Line-ending normalization drift is present.
   - Evidence: `git diff --stat` emitted CRLF normalization warnings.
   - Impact: noisy diffs and avoidable cross-platform churn.

## Recommendations
1. Add a small `session-end` automation script and invoke it from a hook to guarantee artifact completion (`pull_request.md`, `adr.md`, `manifest.json`, `turns_index.csv`) on every turn.
2. Change SessionStart root resolution to check for required context files first, then fallback to `$HOME/.claude` when local context is absent.
3. Replace hard-coded home fallback paths in skills with a deterministic resolver (`./scripts/...` then `$HOME/.claude/scripts/...` only).
4. Update `analyze` to include a fallback mode when `Task/Explore` is unavailable, so behavior is explicit and deterministic across runtimes.
5. Add a repo-level `.gitattributes` policy to normalize line endings and prevent CRLF/LF churn.

## Appendix
### Artifact completeness snapshot
- Turn directories found: `turn-1` through `turn-14`
- Complete artifact set found for: `turn-4`, `turn-13`, `turn-14`
- Incomplete turns: `turn-1..3,5..12`
- `turns_index.csv` data rows: `3`

### Hook/path snippets
- SessionStart root selection: `settings.json:72`
- Human-review hardcoded fallback: `skills/human-review/SKILL.md:20`
- Analyze Task dependency: `skills/analyze/SKILL.md:34-39`

---
Generated: 2026-03-05T15:14:00Z
Analyzed by: Codex (fallback execution in current runtime)
