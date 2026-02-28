---
name: config-init
description: >-
  Set up symlinks from this repo into ~/.claude/ and ~/.codex/.
  Run once after cloning.
triggers:
  - "config-init"
  - "setup symlinks"
  - "initialize config"
---

# Config Init

Set up all symlinks from `coding-agents-config` into `~/.claude/` and `~/.codex/`.

## Procedure

1. Run the setup script:

```bash
bash scripts/setup.sh
```

2. Report the output to the user — it shows what was created, skipped, or backed up.

3. Verify with:

```bash
ls -la ~/.claude/skills ~/.claude/agents ~/.claude/rules ~/.claude/hooks ~/.claude/templates ~/.claude/scripts ~/.claude/CLAUDE.md ~/.claude/settings.json ~/.codex/agents
```

4. Confirm all symlinks point to the `coding-agents-config` repo.
