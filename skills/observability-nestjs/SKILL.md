---
name: observability-nestjs
description: Refactor a NestJS backend that uses Prisma to add structured backend observability, including API request logging, error logging, Prisma query logging, correlation IDs, redaction, configurable log levels, and configurable log destinations.
version: 1.0.0
author: OpenAI
model_compatibility:
  - claude-code
  - claude-sonnet
  - claude-opus
tags:
  - nestjs
  - prisma
  - observability
  - logging
  - backend
  - refactor
---

# observability-nestjs

## Purpose

Use this skill when you need to refactor an existing **NestJS** backend that already uses **Prisma** so it has production-grade structured logging and a clean observability baseline.

This skill is specifically for the **current implementation** of a real application. It is not for generating a toy example or a greenfield sample app.

## Use This Skill When

Use this skill if the backend needs any of the following:

- **Log every API call**
- **Log every application error**
- **Log every Prisma database operation**
- **Set log levels through configuration**
- **Set log destinations through configuration**
- **Add correlation IDs across request, app, and DB logs**
- **Add redaction for secrets and sensitive fields**
- **Classify slow queries**
- **Document and test the observability behavior**

## Do Not Use This Skill When

Do not use this skill if:

- the app does not use **NestJS**
- the app does not use **Prisma**
- the task is only to add one-off `console.log` statements
- the task is full metrics or tracing rollout without logging refactor scope
- the user wants **TypeORM** or **Drizzle** instrumentation instead

## Core Objective

Refactor the current NestJS + Prisma backend so it logs:

1. **Every inbound API call**
2. **Every outbound API response**
3. **Every handled and unhandled error**
4. **Every Prisma database operation**
5. **Slow Prisma queries**
6. **Application lifecycle events**

## Expected Architecture

The preferred implementation shape is:

- **Middleware** for correlation ID extraction and generation
- **Interceptor** for request timing and request / response completion logging
- **Global exception filter** for consistent error logging
- **Centralized logger service** for all application and Nest system logs
- **Prisma logging hooks** using Prisma Client log configuration and event subscriptions
- **Request context propagation** using **AsyncLocalStorage** or an equivalent mechanism

## Required Configuration Surface

Implement a typed configuration layer for these environment variables at minimum.

| Variable | Purpose |
|---|---|
| `LOG_ENABLED` | Master logging switch |
| `LOG_LEVEL` | Global log level |
| `LOG_FORMAT` | `pretty` or `json` |
| `LOG_DESTINATION` | `console`, `file`, or `both` |
| `LOG_FILE_PATH` | File sink path |
| `LOG_COLORIZE` | Pretty terminal colorization |
| `LOG_TIMESTAMP` | Timestamp inclusion |
| `LOG_INCLUDE_CONTEXT` | Include logger context |
| `LOG_INCLUDE_STACK` | Include stack traces |
| `LOG_REDACT_KEYS` | Comma-separated sensitive keys |
| `LOG_REQUEST_BODY` | Request body logging toggle |
| `LOG_RESPONSE_BODY` | Response body logging toggle |
| `LOG_REQUEST_HEADERS` | Request header logging toggle |
| `LOG_RESPONSE_HEADERS` | Response header logging toggle |
| `LOG_MAX_FIELD_LENGTH` | Truncation threshold |
| `LOG_CORRELATION_ID_HEADER` | Correlation ID header name |
| `LOG_GENERATE_CORRELATION_ID` | Generate ID when missing |
| `LOG_DB_ENABLED` | DB logging switch |
| `LOG_DB_INCLUDE_PARAMS` | Include Prisma query params |
| `LOG_DB_SLOW_QUERY_MS` | Slow query threshold |
| `LOG_HEALTHCHECKS_SILENT` | Reduce health endpoint noise |
| `LOG_SERVICE_NAME` | Service identity |
| `LOG_ENVIRONMENT` | Environment label |

## Logging Requirements

### API Logging

For every request, capture:

- timestamp
- level
- service name
- environment
- correlation ID
- HTTP method
- URL
- route pattern if available
- status code
- duration in milliseconds
- remote IP
- user agent
- controller name if available
- handler name if available
- request size if available
- response size if available

### Error Logging

The implementation must:

- log **`HttpException`** and subclasses
- log unexpected exceptions
- avoid exposing internal details in API responses
- log **4xx** as `warn` by default
- log **5xx** as `error` by default
- include stack traces only when enabled
- include correlation ID and route metadata

### Prisma Logging

The implementation must:

- configure Prisma Client logging explicitly
- enable Prisma log capture for `query`, `info`, `warn`, and `error`
- use event-based logging where appropriate
- capture:
  - raw SQL query text
  - params when enabled
  - duration
  - slow query classification
  - errors
- route Prisma logs through the same centralized logger
- include correlation ID when the Prisma call occurs inside a request scope

## Redaction Requirements

Recursive redaction must apply to at least:

- `password`
- `authorization`
- `cookie`
- `set-cookie`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `apiKey`
- `clientSecret`

Apply redaction to:

- request bodies
- response bodies when enabled
- request headers when enabled
- response headers when enabled
- Prisma query params
- structured error metadata

## Default Execution Procedure

When using this skill, follow this sequence.

### 1. Inspect The Current Backend

Identify:

- bootstrap entrypoint
- HTTP adapter, if relevant
- current config system
- current logger usage
- current Prisma service or PrismaClient construction
- existing middleware, interceptors, filters, and request context patterns
- health endpoint implementation
- current tests touching request lifecycle or Prisma behavior

### 2. Establish Centralized Logging

Create or extend a centralized logging abstraction that:

- supports structured logging
- supports Nest system log integration
- supports log levels
- supports JSON and pretty output
- supports multiple destinations
- supports contextual fields
- supports correlation ID injection
- supports redaction

### 3. Add Correlation ID Propagation

Implement request correlation so that:

- inbound correlation ID is read from the configured header
- a new ID is generated if missing and generation is enabled
- the ID is set on the request context
- the ID is set on the response header
- the same ID is visible in API, error, and Prisma logs

### 4. Add Global API Logging

Implement:

- request-start log
- request-complete log
- duration measurement
- health endpoint suppression or downgrade when configured
- optional header and body logging with redaction and truncation

### 5. Add Global Error Logging

Implement a global exception filter that:

- logs application errors consistently
- classifies log severity by response type
- avoids duplicate logging
- includes stack traces only when enabled
- preserves safe client responses

### 6. Add Prisma Operation Logging

Instrument Prisma so the application logs:

- successful query execution
- query duration
- slow queries
- Prisma warnings
- Prisma errors

Use Prisma Client logging hooks and event subscriptions. Keep params disabled or redacted by default.

### 7. Add Lifecycle Logging

Log:

- bootstrap start
- bootstrap complete
- shutdown start
- shutdown complete
- Prisma connect / disconnect lifecycle when managed explicitly in the codebase

### 8. Update Tests

Add or update tests for:

- request logging on success
- request logging on error
- correlation ID propagation
- exception filter behavior
- redaction behavior
- Prisma query logging
- Prisma error logging
- slow query classification
- logging config parsing

### 9. Update Documentation

Document:

- how logging works
- environment variables
- log level behavior
- log destinations
- correlation IDs
- Prisma logging strategy
- slow query behavior
- local vs production defaults

## Execution Constraints

- Work against the **existing repository structure**
- Do **not** generate a throwaway sample app
- Do **not** add duplicate logging pipelines
- Do **not** leave raw `console.log` in production paths unless intentionally wrapped
- Keep behavior **idiomatic to NestJS and Prisma**
- Preserve existing behavior unless changes are required for observability
- Use **npm** for package changes
- Keep changes strongly typed where practical

## Deliverables

At the end of execution, provide:

1. **Files added**
2. **Files changed**
3. **Dependencies added or removed**
4. **Exact Prisma logging strategy implemented**
5. **Sample logs** for:
   - successful API request
   - failed API request
   - Prisma query
   - slow Prisma query
   - Prisma error
6. **Follow-up recommendations** for phase 2 such as:
   - metrics
   - tracing
   - OpenTelemetry
   - log shipping

## Suggested Prompt

Use the reusable prompt in:

`./templates/prisma-observability-refactor-prompt.md`

If needed, paste that prompt into Claude Code and then adapt the file targets to the repository that is currently open.

## Success Criteria

This skill is complete when all of the following are true:

- a single request produces a start log and completion log
- a request-scoped Prisma call produces a Prisma log with the same correlation ID
- a `4xx` error produces a structured warning log
- a `5xx` error produces a structured error log
- slow queries are classified consistently
- log level and destination are configurable from environment variables
- sensitive fields are redacted
- tests cover the main observability paths
- documentation explains how the implementation works
