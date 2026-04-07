# Update DSL Skills to Accept a DSL File Path

## Context

You are a **senior engineer** updating the existing **DSL-driven skill system**.

The current skill layout is:

```text
skills/
  app-from-dsl/           # Orchestrator - coordinates all skills
  dsl-model-interpreter/  # Foundation - parses YAML specifications
  prisma-persistence/     # Backend - database schema generation
  nestjs-crud-resource/   # Backend - API module generation
  field-mapper-generator/ # Cross-cutting - layer transformation code
  react-form-page/        # Frontend - form and page generation
  http-test-artifacts/    # Testing - HTTP request file generation
```

## Task

Update the skills so that **`app-from-dsl` accepts a file path to the DSL input files at execution time**.

The caller will provide a **file path** that points to the DSL source file or DSL directory. The skills must be revised to support this as the primary input mechanism.

## Required Changes

### `app-from-dsl`

Update the orchestrator skill so that:

1. It explicitly accepts a **DSL file path** as input.
2. It treats that path as the authoritative source for locating the DSL files.
3. It validates that the path exists before proceeding.
4. It determines whether the path is:

    * a single DSL file, or
    * a directory containing DSL files
5. It passes the resolved path information to downstream skills in a clear, consistent format.
6. It documents expected input examples in the skill instructions.

### `dsl-model-interpreter`

Update this skill so that:

1. It reads the DSL from the **provided file path** instead of assuming a fixed location.
2. It supports both:

    * a path to a single YAML DSL file
    * a path to a directory containing one or more YAML DSL files
3. It documents path resolution rules.
4. It fails with a clear error when:

    * the path does not exist
    * the file type is unsupported
    * no DSL files are found in the directory

### Downstream Skills

Review and update all downstream skills so they no longer assume DSL content comes from a hardcoded or implicit location.

This includes:

* **`prisma-persistence`**
* **`nestjs-crud-resource`**
* **`field-mapper-generator`**
* **`react-form-page`**
* **`http-test-artifacts`**

For each skill:

1. Update the instructions to state whether the skill receives:

    * the resolved DSL file path,
    * parsed DSL content,
    * or both
2. Remove any wording that assumes DSL files are in a fixed repository location.
3. Ensure the contract between skills is explicit and consistent.

## Implementation Requirements

### Input Contract

Define and document a consistent input contract for the orchestrator and downstream skills.

At minimum, the contract should specify:

* original input path
* resolved absolute or normalized path
* input type: `file` or `directory`
* discovered DSL files
* parsed model output passed to later stages

### Skill Documentation

Update each affected `SKILL.md` so that it clearly states:

* required inputs
* optional inputs
* expected path behavior
* failure conditions
* examples of valid usage

### Error Handling

Add explicit guidance for these cases:

* invalid path
* missing file
* empty directory
* directory with no supported DSL files
* malformed YAML
* ambiguous multi-file input, if applicable

### Backward Compatibility

If existing skills currently assume a default DSL location, update them so that:

1. the **file path input** is the preferred mechanism
2. any legacy assumption is either removed or explicitly marked as deprecated

## Deliverables

Produce updated `SKILL.md` files for every affected skill.

At minimum, update:

```text
skills/app-from-dsl/SKILL.md
skills/dsl-model-interpreter/SKILL.md
skills/prisma-persistence/SKILL.md
skills/nestjs-crud-resource/SKILL.md
skills/field-mapper-generator/SKILL.md
skills/react-form-page/SKILL.md
skills/http-test-artifacts/SKILL.md
```

## Acceptance Criteria

The work is complete when:

1. `app-from-dsl` clearly accepts a DSL file path as input.
2. The interpreter reads DSL files from that supplied path.
3. No affected skill relies on an implicit DSL source location.
4. All updated skills document the new path-based workflow.
5. Error handling and input examples are explicitly documented.
6. The skill contracts are internally consistent across the full pipeline.

## Constraints

1. Do not redesign the full skill architecture unless required by this change.
2. Preserve existing responsibilities of each skill.
3. Focus on updating the skills and their contracts, not unrelated refactoring.
4. Keep the instructions precise, implementation-oriented, and ready for direct use.
