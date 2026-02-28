# Session context optimization

## Current snapshot

Claude is running `claude-opus-4-5` with a 200k-token context and is already at 135k (67%) of the limit. `/context` reports the following breakdown:

- Messages: 100.7k tokens (50.3%) — this is the single largest bucket.
- System tools: 17.6k tokens (8.8%).
- Memory files: 6.8k tokens (3.4%), dominated by `CLAUDE.md` (3.8k) plus three large rule files.
- Custom agents: 617 tokens (0.3%).
- Skills: 1k tokens (0.5%).
- Free space: 31k tokens (15.3%) with an auto-compaction buffer of 33k tokens (16.5%).

With only 31k tokens of headroom mid-session, the context is fragile. The dominant contributors are the running message history and the static, rarely referenced memory/rule files.

## Optimization objectives

1. Keep the active token footprint <60% so there is room for longer explanations.
2. Preserve decision context and directives without reloading the entire conversation each time.
3. Flush or compress stale history during each turn while retaining a concise summary for future reference.
4. Maintain enough tokens in the free/autocompaction buffer to absorb tool outputs that may spike unexpectedly.

## Suggestions

1. **Summarize and archive long message threads.**
   - After each major milestone, write a one-paragraph summary into a dedicated memory file (e.g., `docs/context/milestones.md`) and truncate the corresponding messages from the active buffer.
   - Use the autocompaction buffer as a staging area for the trimmed messages so Claude still has access to the summary but not the raw dialogue.

2. **Compact large memory files.**
   - `CLAUDE.md` alone is 3.8k tokens; split it into smaller topical files (e.g., `docs/memory/governance.md`, `docs/memory/workflow.md`) and load only the relevant chunk via `context-prime` when needed.
   - Convert verbose rule documents into bullet summaries plus references to the full `.claude/rules/*.md` files so Claude can skip re-parsing them every turn.

3. **Load context on-demand.**
   - Introduce a lightweight `context-brief.md` that strips out historical data and only keeps the latest `task`, `status`, and `constraints`. The orchestration Step 3 can read this brief first, then load richer files only if the task requires it.
   - Keep per-agent briefing files limited to one screen so `skill-eval` does not end up reloading dozens of rules every time.

4. **Reduce tooling chatter.**
   - Only invoke high-token tools (`Read`, `Bash` results) when needed; rely on summarization for repeated outputs (e.g., `git status`).
   - Teach agents to report key facts instead of reprinting entire log/command output collections.

## Clearing context plan (per-turn orchestration)

1. **Pre-plan summary capture.** When Step 3 (session_context.md) runs, capture the incoming prompt, the active task, and any assumptions in a new `focus-context.md` file.
2. **Mid-turn trimming.** After each internal subtask that spans several messages (analysis → coding → review), launch a quick summarization step that:
   - Extracts the most critical facts and decisions (inputs, outputs, blockers).
   - Appends that summary to `focus-context.md` and `docs/context/history.md`.
   - Clears the detailed messages from the active buffer, leaving behind only the summary and the latest plan.
3. **Post-turn cleanup.** During Step 8/9, persist the trimmed summary to `docs/context/turn-${TURN_ID}-summary.md`, flush the work-in-progress messages, and rely on the newly documented summary + `session_context.md` to rehydrate the next turn.
4. **Focused reload strategy.** When the next turn starts, only the latest `focus-context.md`, the active task, and the instructions collected in Step 3 are reloaded; the older summaries live in the `docs/context/` archive and can be retrieved on demand via `/context-prime` or by explicitly reading the relevant file.

This plan keeps the conversation focused on the current turn while still preserving the trajectory for future agents. The effect is a safer, more predictable context footprint that maximizes the free/autocompaction buffer for unexpected tool outputs.
