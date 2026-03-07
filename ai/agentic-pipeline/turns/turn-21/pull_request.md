# Pull Request — Turn 21

## Summary

- Fixed `session_context.md` not capturing user prompt
- Root cause: `CLAUDE_USER_PROMPT` env var not passed to `turn-init.sh`
- Solution: Pipe prompt via stdin (consistent with `skill-eval.sh`)

## Files Modified

| File | Change |
|------|--------|
| `settings.json` | Added `echo "$CLAUDE_USER_PROMPT" \|` to turn-init.sh hook command |
| `hooks/turn-init.sh` | Added `CLAUDE_USER_PROMPT=$(cat)` to read from stdin |

## Compliance Checklist

- [x] No secrets committed
- [x] Conventional commit ready
- [x] ADR written (minimal)
- [x] Turn artifacts complete
