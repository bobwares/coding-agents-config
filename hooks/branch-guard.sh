#!/usr/bin/env bash
# hooks/branch-guard.sh
# PreToolCall hook — auto-creates task branch when on main or master

set -eo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")
TOOL=$(echo "$TOOL" | tr '[:upper:]' '[:lower:]')

# Only guard bash and write tools
case "$TOOL" in
  write_file|str_replace_based_edit|create_file|bash) ;;
  *) exit 0 ;;
esac

BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  # Auto-create task branch instead of blocking
  REPO_ROOT="."
  TASKS_ROOT="$REPO_ROOT/.appfactory/tasks"
  MAX_SEEN=0

  if [[ -d "$TASKS_ROOT" ]]; then
    shopt -s nullglob
    for dir in "$TASKS_ROOT"/task-*; do
      [[ -d "$dir" ]] || continue
      base_name="${dir##*/}"
      if [[ "$base_name" =~ ^task-([0-9]{3})$ ]]; then
        value=$((10#${BASH_REMATCH[1]}))
        if (( value > max_seen )); then
          MAX_SEEN=$value
        fi
      fi
    done
    shopt -u nullglob
  fi

  NEXT_TASK_ID=$(printf '%03d' $((MAX_SEEN + 1)))
  NEW_BRANCH="task/T${NEXT_TASK_ID}"

  git checkout -b "$NEW_BRANCH" 2>/dev/null || true
  echo "✓ Auto-created branch: $NEW_BRANCH" >&2
fi

exit 0