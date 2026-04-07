---
name: af-memory
description: CRUD operations for AppFactory pipeline state management. Read, write, and update state.yml in .appfactory/memory/ to track pipeline progress, inputs, outputs, and current context across skills.
triggers:
  - memory read
  - memory write
  - memory update
  - get state
  - set state
  - update state
  - pipeline state
  - show memory
  - af memory
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
input-hints:
  - state key path
  - state value
  - pipeline context
output-artifacts:
  - .appfactory/memory/state.yml
---

# af-memory

## Purpose

Use this skill to manage the AppFactory pipeline state stored in `.appfactory/memory/state.yml`. This skill provides CRUD operations that enable other `af-*` skills to:

1. read current pipeline context and inputs;
2. write outputs and results;
3. track progress through the pipeline;
4. maintain state across skill invocations.

## State File Location

The canonical state file is:

```
.appfactory/memory/state.yml
```

If the file does not exist, create it with the default structure.

## State File Structure

```yaml
# AppFactory Pipeline State
# Version: 1.0

project:
  name: <project-name>
  repository: <repository-url>
  created_at: <ISO_TIMESTAMP>

pipeline:
  version: "1.0"
  root_directory: .appfactory

current_task:
  task_id: <current-task-id>
  branch: <current-branch>
  status: active|completed|failed
  current_turn: <current-turn-id>

last_completed_task:
  task_id: <task-id>
  branch: <branch>
  pull_request_url: <url>

# Skill Input/Output Tracking
artifacts:
  prd:
    path: .appfactory/specs/spec-be-prd.md
    status: pending|in_progress|completed|reviewed
    updated_at: <ISO_TIMESTAMP>
    generated_by: <skill-name>
  ddd:
    path: .appfactory/specs/spec-be-ddd.md
    status: pending|in_progress|completed|reviewed
    updated_at: <ISO_TIMESTAMP>
    generated_by: <skill-name>
    depends_on: [prd]
  dsl:
    path: .appfactory/specs/dsl-be-ddd.yaml
    status: pending|in_progress|completed|reviewed
    updated_at: <ISO_TIMESTAMP>
    generated_by: <skill-name>
    depends_on: [ddd]
  plan:
    path: .appfactory/specs/spec-be-plan.md
    status: pending|in_progress|completed|reviewed
    updated_at: <ISO_TIMESTAMP>
    generated_by: <skill-name>
    depends_on: [dsl]
  implementation:
    path: .appfactory/specs/implementation-manifest.yaml
    status: pending|in_progress|completed|reviewed
    updated_at: <ISO_TIMESTAMP>
    generated_by: <skill-name>
    depends_on: [plan]

# Selected Configuration
config:
  tech_stack: <tech-stack-name>
  tech_stack_path: <path-to-implementation>
  target_project: <target-project-path>

# Pipeline Progress
progress:
  current_phase: prd|ddd|dsl|plan|implementation|complete
  completed_phases: []
  failed_phases: []

# Registries
registries:
  tasks_index: .appfactory/tasks_index.csv
  total_tasks: <count>

directories:
  tasks: .appfactory/tasks
  specs: .appfactory/specs
  prompts: .appfactory/prompts
  memory: .appfactory/memory
```

## Commands

### 1. Read State

Read the entire state or a specific path.

**Usage:**

```
af-memory read
af-memory read <path>
```

**Examples:**

```
af-memory read                          # Read entire state
af-memory read project.name             # Read project name
af-memory read artifacts.prd.status     # Read PRD status
af-memory read progress.current_phase   # Read current phase
```

**Procedure:**

1. Read `.appfactory/memory/state.yml`
2. If path is provided, extract the value at that path
3. Display the result

### 2. Write State

Write or overwrite a value at a specific path.

**Usage:**

```
af-memory write <path> <value>
```

**Examples:**

```
af-memory write project.name "customer-app"
af-memory write artifacts.prd.status "completed"
af-memory write progress.current_phase "ddd"
af-memory write config.tech_stack "container-typescript-nestjs"
```

**Procedure:**

1. Read existing state
2. Set value at the specified path
3. Update the file
4. Confirm the write

### 3. Update Artifact Status

Update the status of a pipeline artifact.

**Usage:**

```
af-memory update-artifact <artifact-name> <status> [generated_by]
```

**Examples:**

```
af-memory update-artifact prd completed af-be-build-prd
af-memory update-artifact ddd in_progress af-be-build-ddd
af-memory update-artifact dsl reviewed
```

**Procedure:**

1. Read existing state
2. Update `artifacts.<artifact-name>.status`
3. Update `artifacts.<artifact-name>.updated_at` with current timestamp
4. If `generated_by` is provided, update that field
5. Update progress tracking if applicable
6. Write the state file

### 4. Advance Phase

Move the pipeline to the next phase.

**Usage:**

```
af-memory advance-phase <new-phase>
```

**Examples:**

```
af-memory advance-phase ddd
af-memory advance-phase implementation
```

**Procedure:**

1. Read existing state
2. Add current phase to `progress.completed_phases`
3. Set `progress.current_phase` to new phase
4. Write the state file

### 5. Set Config

Update pipeline configuration.

**Usage:**

```
af-memory set-config <key> <value>
```

**Examples:**

```
af-memory set-config tech_stack "container-typescript-nestjs"
af-memory set-config target_project "/Users/bobware/gallery/customer-app"
```

**Procedure:**

1. Read existing state
2. Set `config.<key>` to value
3. Write the state file

### 6. Update Task Context

Update current task tracking.

**Usage:**

```
af-memory update-task <task_id> <turn_id> [status]
```

**Examples:**

```
af-memory update-task 008 003 active
```

**Procedure:**

1. Read existing state
2. Update `current_task.task_id`
3. Update `current_task.current_turn`
4. Update `current_task.status` if provided
5. Write the state file

### 7. Initialize State

Create or reset the state file with defaults.

**Usage:**

```
af-memory init [project-name]
```

**Procedure:**

1. Detect project name from git remote or directory
2. Create default state structure
3. Write to `.appfactory/memory/state.yml`

### 8. Show Pipeline Status

Display a summary of the current pipeline state.

**Usage:**

```
af-memory status
```

**Procedure:**

1. Read state file
2. Display formatted summary:
   - Project name
   - Current task and turn
   - Current phase
   - Artifact statuses
   - Configuration

## Integration with Other Skills

### Reading Inputs

Other `af-*` skills should read their inputs from memory:

```yaml
# In skill execution, read required inputs:
prd_path: $(af-memory read artifacts.prd.path)
prd_status: $(af-memory read artifacts.prd.status)
```

### Writing Outputs

After generating artifacts, skills should update memory:

```yaml
# After generating PRD:
af-memory update-artifact prd completed af-be-build-prd
af-memory advance-phase ddd
```

### Dependency Checking

Skills should verify dependencies are met:

```yaml
# Before generating DDD, verify PRD is complete:
if [ "$(af-memory read artifacts.prd.status)" != "completed" ]; then
  echo "ERROR: PRD must be completed before generating DDD"
  exit 1
fi
```

## Error Handling

### State File Missing

If the state file does not exist:

1. For read operations: return error with suggestion to run `af-memory init`
2. For write operations: create the file with defaults first

### Invalid Path

If the specified path does not exist:

1. For read: return null/empty
2. For write: create the path structure

### Invalid Value

If the value format is invalid for the expected type:

1. Return validation error
2. Suggest correct format

## Output Format

### Read Operations

Return YAML-formatted output for complex values:

```yaml
artifacts:
  prd:
    path: .appfactory/specs/spec-be-prd.md
    status: completed
```

Return plain text for simple values:

```
completed
```

### Write Operations

Confirm the write:

```
Updated: artifacts.prd.status = completed
```

### Status Display

Display formatted summary:

```
┌─────────────────────────────────────────────────────────┐
│              APPFACTORY PIPELINE STATUS                 │
├─────────────────────────────────────────────────────────┤
│  Project:       customer-app                            │
│  Task:          008 / Turn 003                          │
│  Branch:        task/T008                               │
│  Phase:         ddd                                     │
├─────────────────────────────────────────────────────────┤
│  Artifacts:                                             │
│    PRD:           completed                             │
│    DDD:           in_progress                           │
│    DSL:           pending                               │
│    Plan:          pending                               │
│    Implementation: pending                              │
└─────────────────────────────────────────────────────────┘
```

## Quality Checklist

Before completing a memory operation:

1. State file is valid YAML
2. All timestamps are ISO 8601 format
3. Status values are from allowed set
4. Paths reference existing or expected files
5. Dependencies are logically consistent
