# Pull Request — Turn 43

## Summary

Refactored session/turn initialization architecture. Hooks now output directives; skills do the heavy lifting (context loading, directory creation).

## Changes

| File | Change |
|------|--------|
| `hooks/session-start.sh` | Simplified to output directive for /session-start skill |
| `hooks/turn-init.sh` | Simplified to output directive for /turn-init skill |
| `skills/session-start/SKILL.md` | Enhanced to load context files and display status |
| `skills/turn-init/SKILL.md` | **NEW** — creates turn directory and initializes artifacts |

## Architecture

```
SessionStart hook → directive → Claude runs /session-start → context loaded
UserPromptSubmit hook → directive → Claude runs /turn-init → turn dir created
```

## Benefits

- Context files actually loaded into conversation (skills can read files, hooks can't)
- Logic lives in SKILL.md (easier to maintain than bash)
- Skills can make decisions (e.g., skip turn for pure questions)

## Compliance Checklist

- [x] Metadata headers updated (Author: bobware)
- [x] No breaking changes
- [x] Turn artifacts written
