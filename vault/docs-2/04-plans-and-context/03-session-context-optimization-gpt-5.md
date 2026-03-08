# Session context optimization (GPT-5 model)

## Current snapshot

Codex is now running on a newer GPT-5-class model. The same context pressure pattern still applies: message history grows fastest, while static instructions and memory files create baseline overhead every turn.

To keep the model reliable on longer implementation turns, treat context as a limited working set:

- Keep only active task state in the main thread.
- Persist decisions and milestones to files, not message history.
- Reload archived details on demand instead of carrying them continuously.

## Optimization objectives

1. Keep the active token footprint below 60% during normal implementation turns.
2. Preserve decisions and constraints without retaining full raw chat history.
3. Summarize and archive stale context at each milestone.
4. Maintain sufficient free/autocompaction headroom for large tool outputs.

## Suggestions

1. **Summarize and archive long threads early.**
   - After each milestone (analysis, implementation, verification), write a concise summary to `docs/context/milestones.md`.
   - Keep only the latest plan, current blockers, and next action in active context.

2. **Split and scope static instructions.**
   - Break large always-on docs into focused files by domain (`governance`, `workflow`, `platform`, `testing`).
   - Load only task-relevant sections during execution.

3. **Use a minimal working brief.**
   - Maintain a short `context-brief.md` containing: objective, scope, constraints, files in play, and acceptance checks.
   - Treat this brief as the default reload source for new turns.

4. **Reduce repetitive tool output in chat.**
   - Record command outputs in artifacts where needed and summarize key facts in-thread.
   - Avoid reprinting full logs unless troubleshooting requires raw output.

## Clearing context plan (per-turn orchestration)

1. **Pre-turn setup.** Capture prompt intent, assumptions, and immediate plan in `focus-context.md`.
2. **Mid-turn compression.** After major subtasks, append decisions/results to `focus-context.md` and trim stale detail from active history.
3. **Post-turn persistence.** Save a concise turn summary in `docs/context/turn-${TURN_ID}-summary.md` and rely on artifacts for deep history.
4. **Next-turn reload.** Start with `focus-context.md` + active task files; pull older summaries only when needed.

This keeps GPT-5 context focused on current execution while preserving durable provenance in repository artifacts.
