#!/usr/bin/env bash
# hooks/branch-guard.sh
# PreToolCall hook — blocks write tool calls when on main or master

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')

case "$TOOL" in
  write_file|str_replace_based_edit|create_file|bash) ;;
  *) exit 0 ;;
esac

BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "⛔ BRANCH GUARD: On '${BRANCH}'. Run /branch-guard to create a turn branch first." >&2
  exit 2
fi

exit 0