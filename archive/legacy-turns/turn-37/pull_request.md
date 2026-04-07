# Pull Request — Turn 37

## Summary

Added `Trigger:` field to all hook script metadata headers to document which event triggers each hook.

## Changes

| File | Change |
|------|--------|
| `hooks/session-start.sh` | Added `Trigger: SessionStart` |
| `hooks/turn-init.sh` | Added `Trigger: UserPromptSubmit` |
| `hooks/skill-eval.sh` | Added `Trigger: UserPromptSubmit` |
| `hooks/audit-log.sh` | Added `Trigger: PreToolUse(Bash)` |

## Compliance Checklist

- [x] Metadata headers follow governance format
- [x] No breaking changes
- [x] Turn artifacts written
