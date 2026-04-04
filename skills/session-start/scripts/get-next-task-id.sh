#!/usr/bin/env bash
# App: coding-agents-config
# File: get-next-task-id.sh
# Version: 0.1.0
# Task: 001
# Turns: 001
# Author: AI Coding Agent (unknown)
# Date: 2026-04-03T16:31:45Z
# Description: Resolve the next zero-padded task id from ai/agentic-pipeline/tasks.
# Log:
# 001, 001, 0.1.0, 2026/04/03, 04:31 PM UTC, AI Coding Agent (unknown)
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

printf '%03d\n' $((max_seen + 1))
