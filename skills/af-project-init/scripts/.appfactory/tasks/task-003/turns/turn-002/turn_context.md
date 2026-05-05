# Turn Context: Task 003, Turn 002

## Objective
Fix AppFactory skills showing wrong model in metadata headers (Opus instead of Haiku).

## Investigation
- Found hardcoded `model: opus` in af-be-ddd-orchestrator agent
- Found hardcoded `claude-opus-4-5-20251101` in init-appfactory-project.sh
- Identified metadata header templates use `{{MODEL_NAME}}` placeholder but weren't substituting correctly

## Changes Made
1. Added YAML frontmatter to af-be-ddd/SKILL.md
2. Fixed af-be-ddd-orchestrator: model opus → haiku
3. Fixed init-appfactory-project.sh author header: opus → haiku

## Result
Model metadata now correctly references Haiku (4.5) instead of Opus.
