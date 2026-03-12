#!/usr/bin/env bash
# -------------------------------------------------------------------
# get-next-turn-id.sh
# Resolve the next turn ID for agentic pipeline
# -------------------------------------------------------------------
# Version: 2.0.0
# Author: Claude <noreply@anthropic.com>
# Created: 2026-03-02
# Modified: 2026-03-08
# Description: Resolves the next turn ID by scanning ./ai/turns for
#              directories whose names end in a numeric turn id and
#              returning the highest id + 1.
# -------------------------------------------------------------------

set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

repo_root="${1:-.}"
turns_root="$repo_root/ai/turns"
max_seen=0

if [[ -d "$turns_root" ]]; then
  shopt -s nullglob

  for dir in "$turns_root"/*; do
    [[ -d "$dir" ]] || continue

    base_name="${dir##*/}"

    if [[ "$base_name" =~ ([0-9]+)$ ]]; then
      value=$((10#${BASH_REMATCH[1]}))
      if (( value > max_seen )); then
        max_seen=$value
      fi
    fi
  done

  shopt -u nullglob
fi

echo $((max_seen + 1))