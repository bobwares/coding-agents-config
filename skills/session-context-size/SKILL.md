---
name: session-context-size
description: Capture current context window usage and save a report to ./logs directory. Useful for monitoring token consumption during sessions.
disable-model-invocation: false
---

# Session Context Size

Capture and save a context usage report to the logs directory.

## Step 1: Determine Next File Number

```bash
# Find the highest numbered context file and increment
NEXT_NUM=$(ls ./logs/context-*.md 2>/dev/null | sed 's/.*context-\([0-9]*\)\.md/\1/' | sort -n | tail -1)
NEXT_NUM=$((${NEXT_NUM:-0} + 1))
echo "Next context file: context-${NEXT_NUM}.md"
```

## Step 2: Gather Context Information

Collect the following data:

### Loaded Rules Files
```bash
ls -la .claude/rules/*.md 2>/dev/null | awk '{print $NF}'
```

### Loaded Skills Count
```bash
ls -d .claude/skills/*/ 2>/dev/null | wc -l
```

### CLAUDE.md Size
```bash
wc -c CLAUDE.md 2>/dev/null
```

## Step 3: Generate Report

Write to `./logs/context-${NEXT_NUM}.md`:

```markdown
# Context Usage Report

**Model:** [current model from system prompt]
**Date:** [YYYY-MM-DD]
**Turn:** [current turn if available]

---

## Loaded Context Files

| File | Size (bytes) |
|------|--------------|
| CLAUDE.md | [size] |
| [each rules file] | [size] |

---

## Skills Summary

- **Total Skills:** [count]
- **Loaded in System Prompt:** [list from system-reminder]

---

## MCP Tools

[List any MCP tools visible in the system prompt]

---

## Custom Agents

[List agents from agent descriptions if visible]

---

## Notes

- Context window limit: 200k tokens
- This report captures file sizes and counts
- For precise token usage, run `/context` in the CLI
```

## Step 4: Confirm Save

After writing the file:

```bash
ls -la ./logs/context-${NEXT_NUM}.md
```

Report: "Context report saved to `./logs/context-${NEXT_NUM}.md`"
