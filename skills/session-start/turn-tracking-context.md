# Turn Tracking Rules

Every coding task is a turn. Turns are non-negotiable.

## Every Turn Requires

| Artifact          | Path                                           | When           |
|-------------------|------------------------------------------------|----------------|
| `turn_context.md` | `./ai/agentic-pipeline/turns/turn-${TURN_ID}/` | Pre-execution  |
| `pull_request.md` | `./ai/agentic-pipeline/turns/turn-${TURN_ID}/` | Post-execution |
| `adr.md`          | `./ai/agentic-pipeline/turns/turn-${TURN_ID}/` | Post-execution |
| `manifest.json`   | `./ai/agentic-pipeline/turns/turn-${TURN_ID}/` | Post-execution |

## Post-Execution Always Runs

Even if execution fails, complete all post-execution steps.
A turn without all 4 artifacts is incomplete.

## Registry

Append one row to `./ai/agentic-pipeline/turns_index.csv` at the end of every turn.
Tag the commit: `git tag turn/${TURN_ID} && git push origin turn/${TURN_ID}`

## Full Spec

Invoke `/session-start` for turn state initialization.
See `context_orchestration.md` for full 10-step lifecycle with bash scripts.
