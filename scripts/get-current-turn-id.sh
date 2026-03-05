#!/usr/bin/env bash
# App: coding-agents-config
# File: scripts/get-current-turn-id.sh
# Version: 0.1.1
# Turns: TBD
# Author: AI Coding Agent (GPT-5)
# Date: 2026-03-01T01:22:27Z
# Description: Resolve the current turn id by selecting the highest numeric suffix in the turn artifacts directory.

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  get-current-turn-id.sh [repo_root]

Description:
  Finds the current turn id by scanning the turn artifacts directory and
  selecting the directory with the highest numeric suffix.

Search order:
  1) <repo_root>/ai/agentic-pipeline/turns
  2) <repo_root>/ai/agentic-pipeline/turn

Output:
  Prints only the current turn id to stdout.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

repo_root="${1:-.}"
turns_root=""

if [[ -d "$repo_root/ai/agentic-pipeline/turns" ]]; then
  turns_root="$repo_root/ai/agentic-pipeline/turns"
elif [[ -d "$repo_root/ai/agentic-pipeline/turn" ]]; then
  turns_root="$repo_root/ai/agentic-pipeline/turn"
else
  echo "Error: no turn artifacts directory found under $repo_root/ai/agentic-pipeline/{turns,turn}" >&2
  exit 1
fi

latest_id=-1
latest_dir=""

shopt -s nullglob
for dir in "$turns_root"/*; do
  [[ -d "$dir" ]] || continue
  base_name="${dir##*/}"

  if [[ "$base_name" =~ ([0-9]+)$ ]]; then
    turn_id=$((10#${BASH_REMATCH[1]}))
    if (( turn_id > latest_id )); then
      latest_id=$turn_id
      latest_dir="$dir"
    fi
  fi
done
shopt -u nullglob

if (( latest_id < 0 )); then
  echo "Error: no turn directories with a numeric suffix were found in $turns_root" >&2
  exit 1
fi

echo "$latest_id"
