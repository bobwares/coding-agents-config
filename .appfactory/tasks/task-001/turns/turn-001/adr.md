# ADR — Task 001 Turn 001: Normalize Shell Script Line Endings

- **Date**: 2026-04-03T16:35:57Z
- **Agent**: AI Coding Agent (unknown)
- **Status**: Accepted

No architectural decision made this turn — fixed CRLF-terminated shell helper scripts and added a `.gitattributes` guard for `*.sh` so the `bash\r` execution error does not recur on future edits.
