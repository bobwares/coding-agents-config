#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-.}"
tasks_root="$repo_root/ai/agentic-pipeline/tasks"
max_seen=0

if [[ -d "$tasks_root" ]]; then
  shopt -s nullglob
  for dir in "$tasks_root"/task-*; do
    [[ -d "$dir" ]] || continue
    base_name="${dir##*/}"
    if [[ "$base_name" =~ ^task-([0-9]{3})$ ]]; then
      value=$((10#${BASH_REMATCH[1]}))
      if (( value > max_seen )); then
        max_seen=$value
      fi
    fi
  done
  shopt -u nullglob
fi

printf '%03d
' $((max_seen + 1))
