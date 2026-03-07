#!/usr/bin/env bash
# -------------------------------------------------------------------
# get-next-turn-id.sh
# Resolve the next turn ID for agentic pipeline
# -------------------------------------------------------------------
# Version: 1.0.0
# Author: Claude <noreply@anthropic.com>
# Created: 2026-03-02
# Modified: 2026-03-06
# Description: Resolves the next turn ID using the highest turn ID
#              found in turns_index.csv and existing turn directories.
# -------------------------------------------------------------------

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  get-next-turn-id.sh [repo_root]

Description:
  Finds the next turn id by scanning:
  1) <repo_root>/ai/agentic-pipeline/turns_index.csv (first column numeric ids)
  2) <repo_root>/ai/agentic-pipeline/{turns,turn}/ directories with numeric suffixes

  Returns max(found_ids) + 1, or 1 when no prior turns exist.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

repo_root="${1:-.}"
index_path="$repo_root/ai/agentic-pipeline/turns_index.csv"
index_max=0

if [[ -f "$index_path" ]]; then
  while IFS=',' read -r first_col _; do
    first_col="${first_col//[[:space:]]/}"
    if [[ "$first_col" =~ ^[0-9]+$ ]]; then
      value=$((10#$first_col))
      if (( value > index_max )); then
        index_max=$value
      fi
    fi
  done < "$index_path"
fi

dirs_max=0
for turns_root in "$repo_root/ai/agentic-pipeline/turns" "$repo_root/ai/agentic-pipeline/turn"; do
  [[ -d "$turns_root" ]] || continue
  shopt -s nullglob
  for dir in "$turns_root"/*; do
    [[ -d "$dir" ]] || continue
    base_name="${dir##*/}"
    if [[ "$base_name" =~ ([0-9]+)$ ]]; then
      value=$((10#${BASH_REMATCH[1]}))
      if (( value > dirs_max )); then
        dirs_max=$value
      fi
    fi
  done
  shopt -u nullglob
done

max_seen=$index_max
if (( dirs_max > max_seen )); then
  max_seen=$dirs_max
fi

echo $((max_seen + 1))
