#!/usr/bin/env bash
# -------------------------------------------------------------------
# audit-log.sh
# Agentic pipeline audit logging hook
# -------------------------------------------------------------------
# Version: 1.0.0
# Author: Claude <noreply@anthropic.com>
# Created: 2026-03-06
# Modified: 2026-03-06
# Trigger: PreToolUse(Bash)
# Description: Logs all Bash invocations for debugging and compliance.
#              Exits 0 always (never blocks).
# -------------------------------------------------------------------

AUDIT_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/audit"
LOG_FILE="$AUDIT_DIR/commands.log"

mkdir -p "$AUDIT_DIR" 2>/dev/null || true

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")
CMD=$(echo "${CLAUDE_TOOL_INPUT:-}" | head -c 300 | tr '\n' ' ')

printf '%s | branch=%s | %s\n' "$TIMESTAMP" "$BRANCH" "$CMD" >> "$LOG_FILE" 2>/dev/null || true

exit 0
