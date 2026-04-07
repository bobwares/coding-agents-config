#!/usr/bin/env bash
# App: coding-agents-config
# File: get-next-turn-id.sh
# Version: 0.1.0
# Task: 001
# Turns: 001
# Author: AI Coding Agent (unknown)
# Date: 2026-04-03T16:31:45Z
# Description: Resolve the next zero-padded turn id for an active task.
# Log:
# 001, 001, 0.1.0, 2026/04/03, 04:31 PM UTC, AI Coding Agent (unknown)
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <repo_root> <task_id>" >&2
  exit 1
fi

repo_root="$1"
task_id="$2"
turns_root="$repo_root/.appfactory/tasks/task-${task_id}/turns"
max_seen=0

if [[ -d "$turns_root" ]]; then
  shopt -s nullglob
  for dir in "$turns_root"/turn-*; do
    [[ -d "$dir" ]] || continue
    base_name="${dir##*/}"
    if [[ "$base_name" =~ ^turn-([0-9]{3})$ ]]; then
      value=$((10#${BASH_REMATCH[1]}))
      if (( value > max_seen )); then
        max_seen=$value
      fi
    fi
  done
  shopt -u nullglob
fi

printf '%03d\n' $((max_seen + 1))
