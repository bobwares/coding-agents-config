# Prisma-Specific NestJS Observability Refactor Prompt

You are refactoring an existing NestJS backend that already uses Prisma.

Your task is to implement production-grade backend observability focused on structured logging for the current implementation, not a toy example.

This app already uses Prisma. Do not add support for TypeORM or Drizzle. Refactor the existing NestJS + Prisma implementation only.

## Goal

Implement backend observability so the application logs:

1. every inbound API call
2. every outbound API response
3. every handled and unhandled error
4. every Prisma database operation
5. slow Prisma queries
6. startup and shutdown lifecycle events

Do not generate a sample app. Inspect the current codebase first, then refactor the real implementation.

Use npm for any package changes.

## Repository Inspection Requirements

First inspect the repository and determine:

1. current Nest bootstrap entrypoint
2. whether the HTTP adapter is Express or Fastify
3. current config system and env parsing approach
4. current logger usage
5. current PrismaService / PrismaClient construction
6. whether Prisma is instantiated directly or wrapped in a service
7. any existing middleware, interceptors, filters, or request context support
8. any current request ID / correlation ID implementation
9. any current health endpoint implementation

Then perform the refactor.

## Implementation Requirements

### A. Centralized Logging Configuration

Create a dedicated typed logging config surface driven by environment variables.

Support at minimum:

- `LOG_ENABLED=true|false`
- `LOG_LEVEL=log|fatal|error|warn|debug|verbose`
- `LOG_FORMAT=pretty|json`
- `LOG_DESTINATION=console|file|both`
- `LOG_FILE_PATH=./logs/app.log`
- `LOG_COLORIZE=true|false`
- `LOG_TIMESTAMP=true|false`
- `LOG_INCLUDE_CONTEXT=true|false`
- `LOG_INCLUDE_STACK=true|false`
- `LOG_REDACT_KEYS=password,token,authorization,cookie,set-cookie,secret,apiKey,accessToken,refreshToken,clientSecret`
- `LOG_REQUEST_BODY=false`
- `LOG_RESPONSE_BODY=false`
- `LOG_REQUEST_HEADERS=false`
- `LOG_RESPONSE_HEADERS=false`
- `LOG_MAX_FIELD_LENGTH=2000`
- `LOG_CORRELATION_ID_HEADER=x-correlation-id`
- `LOG_GENERATE_CORRELATION_ID=true`
- `LOG_DB_ENABLED=true`
- `LOG_DB_INCLUDE_PARAMS=false`
- `LOG_DB_SLOW_QUERY_MS=500`
- `LOG_HEALTHCHECKS_SILENT=true`
- `LOG_SERVICE_NAME=<app-name>`
- `LOG_ENVIRONMENT=<node-env>`

Use the app’s existing config conventions where possible.

### B. Centralized Logger

Create or extend a centralized structured logger service.

Requirements:

- use one logger abstraction across application logs and Nest system logs
- support log levels
- support JSON output
- support pretty output for local development
- support console, file, or both destinations
- support contextual fields
- support redaction
- support correlation ID inclusion
- route Nest internal logging through the custom logger via bootstrap integration

Refactor obvious direct console usage to this logger.

### C. Request Correlation

Implement correlation ID support end-to-end.

Requirements:

- read inbound correlation ID from `LOG_CORRELATION_ID_HEADER`
- generate one if missing and `LOG_GENERATE_CORRELATION_ID=true`
- attach correlation ID to request context
- attach correlation ID to response header
- make correlation ID available to request logs, error logs, and Prisma logs
- use `AsyncLocalStorage` or an equivalent request context mechanism appropriate for the codebase

### D. Request / Response Logging

Implement global API logging for every request.

Use:

- middleware for correlation ID initialization
- interceptor for request timing and completion logging

For each request, log:

- timestamp
- level
- service name
- environment
- correlation ID
- HTTP method
- URL
- route pattern if available
- status code
- duration ms
- remote IP
- user agent
- controller name if available
- handler name if available
- request size if available
- response size if available

Behavior:

- emit request-start log
- emit request-complete log
- emit error log on failed requests
- avoid double logging the same exception
- suppress or downgrade health endpoint logs when `LOG_HEALTHCHECKS_SILENT=true`
- do not log bodies or headers by default
- if enabled, redact sensitive fields recursively
- truncate oversized logged fields according to `LOG_MAX_FIELD_LENGTH`

### E. Global Exception Logging

Implement a global exception filter for consistent error logging.

Requirements:

- log `HttpException` and subclasses
- log unexpected exceptions
- include correlation ID
- include route and request metadata
- include stack traces when `LOG_INCLUDE_STACK=true`
- preserve safe client responses
- do not leak internals to API responses
- log `4xx` at `warn` by default
- log `5xx` at `error` by default

### F. Prisma Logging

Refactor the current Prisma implementation to route database activity into the centralized logger.

Requirements:

1. Update `PrismaClient` construction so Prisma logging is configured explicitly.
2. Enable Prisma logging for:
   - `query`
   - `info`
   - `warn`
   - `error`
3. Use event-based Prisma logging where appropriate so the application captures:
   - raw SQL query text
   - query params
   - duration
4. Respect `LOG_DB_ENABLED` and `LOG_DB_INCLUDE_PARAMS`.
5. Redact or omit query params by default unless `LOG_DB_INCLUDE_PARAMS=true`.
6. Classify slow queries using `LOG_DB_SLOW_QUERY_MS`.
7. Log Prisma errors through the centralized logger.
8. Include correlation ID in Prisma logs when the DB call occurs during a request.

Prisma log payload should include at minimum:

- correlation ID if available
- `subsystem=prisma`
- query text
- params only when enabled and redacted
- duration ms
- `slow=true|false`
- log level
- error metadata when applicable

Where beneficial, enhance Prisma observability using a Prisma Client query extension so logs can include higher-level operation metadata in addition to raw query event data. Keep the implementation type-safe and idiomatic.

### G. Lifecycle Logging

Log application lifecycle events:

- application bootstrap start
- application bootstrap complete
- shutdown start
- shutdown complete
- Prisma connect / disconnect lifecycle if the current implementation manages it explicitly

### H. Safety And Redaction

Implement recursive redaction for at least:

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
- Prisma params
- structured error metadata

### I. Tests

Add or update tests for:

- request logging on success
- request logging on error
- correlation ID propagation
- exception filter behavior
- redaction behavior
- Prisma query event logging
- Prisma error logging
- slow query classification
- config parsing defaults and overrides

Use the project’s existing testing conventions.

### J. Documentation

Update the repo documentation with:

- how backend logging works
- environment variables
- how log levels behave
- where logs go
- how correlation IDs work
- how Prisma logging is wired
- how slow query logging works
- local vs production defaults

### K. Output Requirements

After completing the refactor, provide a final summary containing:

1. files added
2. files changed
3. dependencies added or removed
4. exact Prisma logging strategy implemented
5. sample logs for:
   - successful API request
   - failed API request
   - Prisma query
   - slow Prisma query
   - Prisma error
6. any follow-up recommendations for phase 2:
   - metrics
   - tracing
   - OpenTelemetry
   - log shipping

## Quality Bar

- no placeholder-only code
- no toy example files unless required by the current architecture
- no duplicate logging pipeline
- no raw `console.log` in production paths unless intentionally wrapped
- strongly typed where practical
- preserve current behavior unless change is required for observability
- keep the solution idiomatic to NestJS and Prisma

Start by inspecting the current repository and then perform the refactor.
