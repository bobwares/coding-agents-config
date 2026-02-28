#!/bin/bash
# Skill Evaluation Hook — agentic-pipeline
# Wrapper that delegates to the Node.js evaluation engine.
# Runs on UserPromptSubmit. Exits 0 always (never blocks the user).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/skill-eval.js"

if ! command -v node &>/dev/null; then
  exit 0
fi

if [[ ! -f "$NODE_SCRIPT" ]]; then
  exit 0
fi

# Read prompt text from stdin so UserPromptSubmit piping works reliably.
cat - | node "$NODE_SCRIPT" 2>/dev/null

exit 0
