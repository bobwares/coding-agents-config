# yq Reference Guide

## Overview

`yq` is a lightweight command-line YAML processor. It is to YAML what `jq` is to JSON — a tool for reading, writing, and transforming YAML files from the command line.

AppFactory uses `yq` in the `af-state.sh` utility to manage the `.appfactory/state.yaml` file.

## Installation

### macOS (Homebrew)

```bash
brew install yq
```

### Ubuntu / Debian

```bash
# Option 1: Snap (recommended, latest version)
sudo snap install yq

# Option 2: Download binary
VERSION=v4.40.5
BINARY=yq_linux_amd64
wget https://github.com/mikefarah/yq/releases/download/${VERSION}/${BINARY} -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Go Install

```bash
go install github.com/mikefarah/yq/v4@latest
```

### Windows

```powershell
# Chocolatey
choco install yq

# Scoop
scoop install yq

# winget
winget install --id MikeFarah.yq
```

### Docker

```bash
docker run --rm -v "${PWD}:/workdir" mikefarah/yq '.field' file.yaml
```

## Verify Installation

```bash
yq --version
# yq (https://github.com/mikefarah/yq/) version v4.40.5
```

## Important Note

There are two different tools named `yq`:

| Tool | Author | Language | Syntax |
|------|--------|----------|--------|
| `yq` | Mike Farah | Go | jq-like (`.field.subfield`) |
| `yq` | Andrey Kislyuk | Python | jq wrapper |

**AppFactory requires the Mike Farah (Go) version.** The syntax examples in this document and in `af-state.sh` use this version.

To check which version you have:

```bash
yq --version
# Mike Farah version shows: yq (https://github.com/mikefarah/yq/) version v4.x.x
# Python version shows: yq x.x.x
```

## Basic Usage

### Read a Value

```bash
# Read a scalar value
yq '.workflow.current_stage' state.yaml
# Output: prd

# Read with raw output (no quotes)
yq -r '.project.name' state.yaml
# Output: Customer Service App
```

### Read Nested Values

```bash
# Dot notation for nested fields
yq '.workflow.stages.prd.status' state.yaml
# Output: complete

# Array access
yq '.history[0].action' state.yaml
# Output: started

# Last array element
yq '.history[-1]' state.yaml
```

### Write / Update Values

```bash
# Update in place (-i flag)
yq -i '.workflow.current_stage = "ddd"' state.yaml

# Set a string value
yq -i '.artifacts.prd.status = "approved"' state.yaml

# Set null
yq -i '.artifacts.dsl.created_at = null' state.yaml
```

### Array Operations

```bash
# Append to array
yq -i '.history += [{"stage": "prd", "action": "started"}]' state.yaml

# Get array length
yq '.history | length' state.yaml

# Filter array elements
yq '.history[] | select(.action == "completed")' state.yaml

# Get all values of a field from array
yq '.history[].stage' state.yaml
```

### Conditional Selection

```bash
# Select stages that are complete
yq '.workflow.stages | to_entries | map(select(.value.status == "complete")) | .[].key' state.yaml

# Check if a value equals something
yq '.workflow.stages.prd.status == "complete"' state.yaml
# Output: true
```

### Output Formats

```bash
# Default: YAML output
yq '.project' state.yaml

# JSON output
yq -o=json '.project' state.yaml

# Props format (key=value)
yq -o=props '.project' state.yaml
```

## AppFactory-Specific Examples

### Check Stage Status

```bash
# Is PRD stage complete?
yq '.workflow.stages.prd.status == "complete"' .appfactory/state.yaml

# Get current stage
yq -r '.workflow.current_stage' .appfactory/state.yaml
```

### Update Stage to In-Progress

```bash
yq -i '.workflow.stages.ddd.status = "in_progress"' .appfactory/state.yaml
yq -i '.workflow.current_stage = "ddd"' .appfactory/state.yaml
```

### Mark Stage Complete with Timestamp

```bash
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
yq -i ".workflow.stages.prd.status = \"complete\"" .appfactory/state.yaml
yq -i ".workflow.stages.prd.completed_at = \"$NOW\"" .appfactory/state.yaml
```

### Append History Entry

```bash
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
yq -i ".history += [{\"timestamp\": \"$NOW\", \"stage\": \"prd\", \"action\": \"completed\", \"agent\": \"claude\"}]" .appfactory/state.yaml
```

### Get Artifact Path

```bash
yq -r '.artifacts.prd.path' .appfactory/state.yaml
# Output: ai/specs/spec-be-prd.md
```

### List All Pending Stages

```bash
yq '.workflow.stages | to_entries | map(select(.value.status == "pending")) | .[].key' .appfactory/state.yaml
```

### Check Prerequisites for a Stage

```bash
yq -r '.workflow.stages.ddd.requires[]' .appfactory/state.yaml
# Output: prd
```

## Common Patterns

### Read, Modify, Write (Safe Pattern)

```bash
# Read current value
CURRENT=$(yq '.workflow.current_stage' state.yaml)

# Modify in place
yq -i '.workflow.current_stage = "ddd"' state.yaml

# Verify
yq '.workflow.current_stage' state.yaml
```

### Quoting in Shell Scripts

When using variables in yq expressions within bash:

```bash
STAGE="prd"
STATUS="complete"

# Use double quotes around the expression, escape inner quotes
yq -i ".workflow.stages.$STAGE.status = \"$STATUS\"" state.yaml

# Or use single quotes with variable interpolation
yq -i '.workflow.stages.'"$STAGE"'.status = "'"$STATUS"'"' state.yaml
```

### Check Before Update

```bash
# Only update if not already complete
if [[ $(yq ".workflow.stages.prd.status" state.yaml) != "complete" ]]; then
  yq -i '.workflow.stages.prd.status = "complete"' state.yaml
fi
```

## Troubleshooting

### "command not found: yq"

Install yq using the instructions above.

### Wrong yq Version (Python vs Go)

If you see different syntax errors, you may have the Python version installed:

```bash
# Check version
yq --version

# If Python version, install Go version alongside
brew install yq  # This installs Mike Farah's Go version
```

### Permission Denied on -i (In-Place Edit)

```bash
# Check file permissions
ls -la state.yaml

# Fix permissions
chmod 644 state.yaml
```

### Invalid YAML After Edit

Always validate after edits:

```bash
yq '.' state.yaml > /dev/null && echo "Valid YAML" || echo "Invalid YAML"
```

## Resources

- GitHub: https://github.com/mikefarah/yq
- Documentation: https://mikefarah.gitbook.io/yq/
- Playground: https://yq-playground.io/
