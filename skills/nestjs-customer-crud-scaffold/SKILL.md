---
name: nestjs-customer-crud-scaffold
description: Scaffold a NestJS customer CRUD application from a schema file using a non-interactive Node.js wrapper around the Nest CLI. Use when an agent needs to create a NestJS app, generate customer module/service/controller files, and write DTO/entity/value-object source code into the correct project locations.
compatibility: Requires Node.js, npm, and npx. Designed for agent environments with non-interactive shells. Optionally needs network access the first time npx resolves @nestjs/cli.
metadata:
  author: OpenAI
  version: "1.0.0"
---

# Purpose

Use this skill to create a NestJS CRUD backend for a standard customer domain from a schema JSON file. The wrapper is non-interactive and returns structured JSON to stdout so an agent can reliably parse success, failure, written files, and warnings.

This skill intentionally avoids `nest g resource` because the Agent Skills guidance requires scripts to avoid interactive prompts. Instead, it calls non-interactive Nest CLI generators for the app shell and feature shell, then writes the DTO, entity, and value-object files deterministically.

See [the reference guide](references/REFERENCE.md) for the request contract and generation rules.

# When to use

Use this skill when:

- a NestJS customer CRUD app needs to be scaffolded from a JSON schema
- the agent must write files into the correct app locations
- the execution environment is non-interactive
- the caller needs structured JSON output instead of prose

# Inputs

The wrapper accepts a single request JSON file.

Minimum useful request:

```json
{
  "appName": "customer-crud-api",
  "destinationRoot": "/workspace/apps",
  "schemaPath": "/workspace/specs/customer.schema.json"
}
```

Optional fields are documented in `references/REFERENCE.md`.

# Script

Run:

```bash
node scripts/create-nestjs-customer-crud.js --request /absolute/path/to/request.json
```

Show help:

```bash
node scripts/create-nestjs-customer-crud.js --help
```

# Expected behavior

The script will:

1. Validate the request JSON.
2. Load the schema JSON.
3. Create the NestJS app with `npx @nestjs/cli new` if it does not already exist.
4. Generate a feature shell with Nest CLI commands:
   - module
   - service
   - controller
5. Write customer-specific DTO, entity, and address value-object files.
6. Overwrite the generated controller and service with CRUD implementations for the schema.
7. Return structured JSON to stdout.

# Output contract

Success response shape:

```json
{
  "status": "ok",
  "appRoot": "/workspace/apps/customer-crud-api",
  "filesWritten": [
    "/workspace/apps/customer-crud-api/src/customers/customers.controller.ts"
  ],
  "warnings": []
}
```

Failure response shape:

```json
{
  "status": "error",
  "errorCode": "INVALID_REQUEST",
  "message": "schemaPath is required"
}
```

# Notes for agents

- Pass absolute paths whenever possible.
- Keep stdout reserved for final JSON only.
- Read stderr for diagnostics.
- Prefer `overwritePolicy: "fail"` unless mutation is explicitly intended.
- Use `dryRun: true` first when you need to preview the file plan.
