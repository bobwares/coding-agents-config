#!/usr/bin/env bash
# -------------------------------------------------------------------
# setup.sh
# Create symlinks for coding-agents-config
# -------------------------------------------------------------------
# Version: 1.0.0
# Author: Claude <noreply@anthropic.com>
# Created: 2026-03-06
# Modified: 2026-03-06
# Description: Creates symlinks from coding-agents-config into
#              ~/.claude/ and ~/.codex/ directories.
# -------------------------------------------------------------------

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
CODEX_DIR="$HOME/.codex"
LOCAL_CLAUDE_DIR="$REPO_DIR/.claude"

# Items to symlink into ~/.claude/
CLAUDE_TARGETS=(skills agents rules hooks templates scripts plugins CLAUDE.md settings.json)
# Items to symlink into ~/.codex/
CODEX_TARGETS=(agents AGENTS.md)
# Items to symlink into repo-local ./.claude/
LOCAL_CLAUDE_TARGETS=(CLAUDE.md)

created=0
skipped=0
backed_up=0

link_item() {
  local target_dir="$1"
  local name="$2"
  local src="$REPO_DIR/$name"
  local dest="$target_dir/$name"

  if [ -L "$dest" ]; then
    local current
    current="$(readlink "$dest")"
    if [ "$current" = "$src" ]; then
      echo "  skip  $dest (already correct)"
      ((skipped++)) || true
      return
    fi
    echo "  backup $dest -> ${dest}.bak (wrong symlink)"
    mv "$dest" "${dest}.bak"
    ((backed_up++)) || true
  elif [ -e "$dest" ]; then
    echo "  backup $dest -> ${dest}.bak"
    mv "$dest" "${dest}.bak"
    ((backed_up++)) || true
  fi

  ln -s "$src" "$dest"
  echo "  link  $dest -> $src"
  ((created++)) || true
}

echo "==> Setting up Claude Code symlinks"
mkdir -p "$CLAUDE_DIR"

for name in "${CLAUDE_TARGETS[@]}"; do
  link_item "$CLAUDE_DIR" "$name"
done

echo ""
echo "==> Setting up Codex symlinks"
mkdir -p "$CODEX_DIR"
for name in "${CODEX_TARGETS[@]}"; do
  link_item "$CODEX_DIR" "$name"
done

echo ""
echo "==> Setting up repo-local .claude symlinks"
mkdir -p "$LOCAL_CLAUDE_DIR"
for name in "${LOCAL_CLAUDE_TARGETS[@]}"; do
  link_item "$LOCAL_CLAUDE_DIR" "$name"
done

echo ""
echo "Done: $created created, $skipped skipped, $backed_up backed up"
