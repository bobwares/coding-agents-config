#!/usr/bin/env bash
# setup.sh — Create symlinks from coding-agents-config into ~/.claude/ and ~/.codex/
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
CODEX_DIR="$HOME/.codex"

# Items to symlink into ~/.claude/
CLAUDE_TARGETS=(skills agents rules hooks templates scripts CLAUDE.md settings.json)

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
link_item "$CODEX_DIR" "agents"

echo ""
echo "Done: $created created, $skipped skipped, $backed_up backed up"
