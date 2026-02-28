# Hooks Reference

This document catalogs all hooks defined under the `.claude` directory. Hooks are shell scripts or inline commands that execute automatically in response to Claude Code lifecycle events.

## Hook Summary Table

| Name | Purpose | Trigger | Skills/Agents Used |
|------|---------|---------|-------------------|
| **SessionStart** | Loads context files, displays turn status and governance state | `SessionStart` | None (loads context files: `context_container.md`, `context_session.md`, `context_conventions.md`, `context_governance.md`, `context_orchestration.md`, `context_adr.md`, `context_skills.md`) |
| **turn-init.sh** | Creates turn directory, `session_context.md`, and `execution_trace.json` for provenance tracking | `UserPromptSubmit` | None (infrastructure for turn lifecycle) |
| **skill-eval.sh** | Analyzes user prompts and suggests relevant domain skills to activate | `UserPromptSubmit` | Suggests: `pattern-nextjs`, `pattern-nestjs`, `pattern-spring`, `pattern-drizzle`, `pattern-shadcn`, `pattern-vercel-ai`, `pattern-testing`, `pattern-react-ui`, `pattern-api-design`, `systematic-debugging` |
| **audit-log.sh** | Logs all Bash invocations for debugging and compliance | `PreToolUse(Bash)` | None |
| **Branch Protection** | Prevents direct edits to `main` or `master` branches | `PreToolUse(Edit\|MultiEdit\|Write)` | None |
| **Prettier Formatter** | Auto-formats files (ts, tsx, js, jsx, json, css, md) after edits | `PostToolUse(Edit\|MultiEdit\|Write)` | None |
| **Package Install** | Auto-runs `pnpm install` or `npm install` after `package.json` changes | `PostToolUse(Edit\|MultiEdit\|Write)` | None |
| **Test Runner** | Auto-runs tests after test file (`.test.ts`, `.spec.ts`) changes | `PostToolUse(Edit\|MultiEdit\|Write)` | None |
| **TypeCheck** | Auto-runs `pnpm typecheck` after TypeScript file changes | `PostToolUse(Edit\|MultiEdit\|Write)` | None |

---

## Detailed Hook Descriptions

### SessionStart

**File:** Inline in `.claude/settings.json`
**Trigger:** `SessionStart`

Runs when a new Claude Code session begins. Loads all context files and displays the current turn status.

**Actions:**
- Verifies presence of 7 context files in `.claude/context/`
- Reads `turns_index.csv` to determine last/next turn ID
- Displays governance status reminder

---

### turn-init.sh

**File:** `.claude/hooks/turn-init.sh`
**Trigger:** `UserPromptSubmit`

Initializes a new turn directory for every user prompt. This is the foundation of the turn lifecycle provenance system.

**Actions:**
- Resolves next `TURN_ID` from `turns_index.csv`
- Creates `./ai/agentic-pipeline/turns/turn-${TURN_ID}/`
- Writes `session_context.md` with metadata (turn ID, timestamp, branch, prompt preview)
- Writes `execution_trace.json` with `requestedSkillsFromPrompt`, `skillsExecuted`, and `agentsExecuted`
- Outputs turn initialization banner

---

### skill-eval.sh / skill-eval.js

**Files:** `.claude/hooks/skill-eval.sh`, `.claude/hooks/skill-eval.js`, `.claude/hooks/skill-rules.json`
**Trigger:** `UserPromptSubmit`

Analyzes user prompts using keyword matching, regex patterns, and file path detection to suggest relevant domain skills.

**Actions:**
- Parses user prompt for keywords and file paths
- Scores potential skill matches using `skill-rules.json`
- Outputs up to 3 skill suggestions with confidence levels (HIGH/MED/LOW)

**Skills Evaluated:**
| Skill | Priority | Key Triggers |
|-------|----------|--------------|
| `pattern-nextjs` | 9 | next.js, app router, server component, `apps/web/app/**` |
| `pattern-nestjs` | 9 | nestjs, @Controller, @Injectable, `apps/api/src/**` |
| `pattern-testing` | 9 | vitest, test, mock, `**/*.test.ts` |
| `systematic-debugging` | 9 | bug, broken, not working, crash |
| `pattern-spring` | 8 | spring, java, @RestController, `**/*.java` |
| `pattern-drizzle` | 8 | drizzle, schema, migration, `packages/database/**` |
| `pattern-vercel-ai` | 8 | streamText, useChat, ai sdk |
| `pattern-shadcn` | 7 | shadcn, dialog, form, `packages/ui/**` |
| `pattern-react-ui` | 7 | loading state, custom hook, `apps/web/hooks/**` |
| `pattern-api-design` | 7 | rest api, pagination, openapi |

---

### audit-log.sh

**File:** `.claude/hooks/audit-log.sh`
**Trigger:** `PreToolUse(Bash)`

Logs all Bash command invocations for compliance and debugging purposes.

**Actions:**
- Creates `.claude/audit/` directory if missing
- Appends timestamped entry to `.claude/audit/commands.log`
- Records: timestamp, branch, command (first 300 chars)

**Log Format:**
```
2026-02-24T22:28:19Z | branch=feature/my-work | git status
```

---

### Branch Protection

**File:** Inline in `.claude/settings.json`
**Trigger:** `PreToolUse(Edit|MultiEdit|Write)`

Prevents accidental direct edits to protected branches (`main`, `master`).

**Actions:**
- Checks current git branch
- Blocks edit operations if on `main` or `master`
- Returns exit code 2 with error message

---

### Prettier Formatter

**File:** Inline in `.claude/settings.json`
**Trigger:** `PostToolUse(Edit|MultiEdit|Write)`

Automatically formats files after edits using Prettier.

**Supported Extensions:** `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.md`

---

### Package Install

**File:** Inline in `.claude/settings.json`
**Trigger:** `PostToolUse(Edit|MultiEdit|Write)`

Auto-installs dependencies when `package.json` is modified.

**Actions:**
- Detects `package.json` edits (excluding `node_modules`)
- Runs `pnpm install` or `npm install` in background

---

### Test Runner

**File:** Inline in `.claude/settings.json`
**Trigger:** `PostToolUse(Edit|MultiEdit|Write)`

Automatically runs tests when test files are modified.

**Pattern:** Files matching `*.test.ts`, `*.test.tsx`, `*.spec.ts`

**Command:** `pnpm test --run --reporter=dot`

---

### TypeCheck

**File:** Inline in `.claude/settings.json`
**Trigger:** `PostToolUse(Edit|MultiEdit|Write)`

Runs TypeScript type checking after editing TypeScript files.

**Pattern:** Files matching `*.ts`, `*.tsx`

**Command:** `pnpm typecheck`

---

## Hook Configuration

Hooks are configured in `.claude/settings.json` under the `hooks` key:

```json
{
  "hooks": {
    "SessionStart": [...],
    "UserPromptSubmit": [...],
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

### Trigger Events

| Event | When Fired |
|-------|------------|
| `SessionStart` | New Claude Code session begins |
| `UserPromptSubmit` | User submits a prompt |
| `PreToolUse` | Before a tool executes (can block with exit code 2) |
| `PostToolUse` | After a tool completes |

### Environment Variables Available to Hooks

| Variable | Description |
|----------|-------------|
| `CLAUDE_USER_PROMPT` | The user's submitted prompt text |
| `CLAUDE_TOOL_INPUT` | Tool input (for tool-related hooks) |
| `CLAUDE_TOOL_RESULT_FILE` | File path affected (for file operations) |
| `CLAUDE_PROJECT_DIR` | Project root directory |

---

## Adding New Hooks

1. Create a shell script in `.claude/hooks/`
2. Make it executable: `chmod +x .claude/hooks/my-hook.sh`
3. Register in `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$(pwd)/.claude/hooks/my-hook.sh\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Best Practices:**
- Always exit 0 unless intentionally blocking (exit 2)
- Keep timeouts short (3-10 seconds)
- Redirect stderr to avoid noise: `2>/dev/null`
- Never block user flow unless absolutely necessary
