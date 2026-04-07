# Pull Request — Turn 22

## Summary

- Fixed prompt extraction from `CLAUDE_USER_PROMPT`
- `CLAUDE_USER_PROMPT` is JSON with `.prompt` field, not plain text
- Added jq parsing to extract actual prompt from JSON envelope

## Files Modified

| File | Change |
|------|--------|
| `hooks/turn-init.sh` | Parse JSON and extract `.prompt` field using jq |

## Compliance Checklist

- [x] No secrets committed
- [x] Conventional commit ready
- [x] ADR written (minimal)
- [x] Turn artifacts complete
