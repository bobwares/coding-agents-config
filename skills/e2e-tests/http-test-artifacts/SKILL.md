---
name: http-test-artifacts
description: Generate HTTP request files for API endpoint testing. Use when creating .http files for REST client testing of backend endpoints.
---

# HTTP Test Artifacts

Generate `.http` request files from `app-dsl/backend/` endpoint specifications.

## Purpose

Create HTTP request files for:
- Manual API testing via REST clients (VS Code, IntelliJ)
- Smoke testing during development
- API documentation by example
- CI integration testing

## Use When

- Creating a new API resource
- Adding new endpoints
- Documenting API contracts

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `parsed_backend` | Parsed backend specification from `dsl-model-interpreter` | **Yes** |
| `parsed_api_model` | Parsed API model from `dsl-model-interpreter` | **Yes** |
| `dsl_context` | DSL context with path metadata from orchestrator | **Yes** |
| `resource` | Plural kebab-case (e.g., `customers`) | **Yes** |

### Input Contract

This skill receives **parsed content** from the `dsl-model-interpreter`, not raw file paths.

**Expected `parsed_backend` structure:**
```json
{
  "endpoints": {
    "createCustomer": {
      "method": "POST",
      "path": "/api/customers",
      "requestModelRef": "..."
    },
    "getCustomer": {
      "method": "GET",
      "path": "/api/customers/{id}"
    }
  }
}
```

**Expected `parsed_api_model` structure:**
```json
{
  "models": {
    "CreateCustomerRequest": {
      "fields": {
        "firstName": { "type": "string", "required": true },
        "lastName": { "type": "string", "required": true }
      }
    }
  }
}
```

**Expected `dsl_context` structure:**
```json
{
  "originalPath": "./app-dsl",
  "resolvedPath": "/absolute/path/to/app-dsl",
  "inputType": "directory",
  "entity": "Customer",
  "resource": "customers"
}
```

### Legacy Compatibility

**Deprecated:** Direct file path inputs are deprecated. Use the orchestrator's parsed content instead.

## Outputs

**CRITICAL: Generate ONE FILE PER HTTP VERB. Do NOT combine requests into a single file.**

| Output | Location |
|--------|----------|
| POST request | `http/{resources}-post.http` |
| GET all | `http/{resources}-get-all.http` |
| GET by ID | `http/{resources}-get-by-id.http` |
| PATCH/PUT | `http/{resources}-patch.http` |
| DELETE | `http/{resources}-delete.http` |
| Health check | `http/health-get.http` |

**VIOLATION: Creating `{resources}.http` with all requests combined is WRONG.**

For `customers` resource, you MUST create exactly these 6 files:
```
http/health-get.http
http/customers-post.http
http/customers-get-all.http
http/customers-get-by-id.http
http/customers-patch.http
http/customers-delete.http
```

## Dependencies

| Skill | Purpose |
|-------|---------|
| `dsl-model-interpreter` | Parse backend and API model YAML |
| `nestjs-crud-resource` | Backend must exist to test |

## Repository Patterns Reproduced

### Directory Structure

```
http/
  health-get.http
  {resources}-post.http
  {resources}-get-all.http
  {resources}-get-by-id.http
  {resources}-patch.http
  {resources}-delete.http
```

### File Naming Convention

```
{resources}-{method}.http
```

Where:
- `{resources}` = plural resource name (e.g., `customers`)
- `{method}` = HTTP method or action (e.g., `post`, `get-all`, `get-by-id`, `patch`, `delete`)

### HTTP File Format

```http
###
# App: base-node-fullstack
# File: http/{resources}-{method}.http
# Version: 0.1.0
# Turn: {TURN_ID}
# Author: AI Coding Agent ({MODEL_NAME})
# Date: {ISO8601_DATE}
# Description: HTTP test for {METHOD} /{resources} endpoint
###

@baseUrl = http://localhost:3001

### Request Name - Description
{METHOD} {{baseUrl}}/{path}
Content-Type: application/json
Accept: application/json

{request body if applicable}
```

### Variable Conventions

```http
@baseUrl = http://localhost:3001
@{entity}Id = 00000000-0000-0000-0000-000000000001
@authToken = Bearer xxx
```

### Request Separator

Use `###` with descriptive name:

```http
### Create Customer - Minimal Required Fields
POST {{baseUrl}}/customers

### Create Customer - All Fields
POST {{baseUrl}}/customers

### Create Customer - Validation Error
POST {{baseUrl}}/customers
```

## Instructions

### Step 1: Use Parsed Backend Specification

**Receive parsed content from the orchestrator** (via `dsl-model-interpreter` output):

**From `parsed_backend`:**
```json
{
  "endpoints": {
    "createCustomer": {
      "method": "POST",
      "path": "/api/customers",
      "requestModelRef": "..."
    },
    "getCustomer": {
      "method": "GET",
      "path": "/api/customers/{id}"
    }
  }
}
```

**From `parsed_api_model`:**
```json
{
  "models": {
    "CreateCustomerRequest": {
      "fields": {
        "firstName": { "type": "string", "required": true }
      }
    }
  }
}
```

**Note:** Do NOT read DSL files directly. The orchestrator provides pre-parsed content.

### Step 2: Generate POST File

Create `http/{resources}-post.http`:

```http
###
# Metadata header
###

@baseUrl = http://localhost:3001

### Create {Entity} - Minimal Required Fields
POST {{baseUrl}}/{resources}
Content-Type: application/json
Accept: application/json

{
  "requiredField1": "value1",
  "requiredField2": "value2"
}

### Create {Entity} - All Fields
POST {{baseUrl}}/{resources}
Content-Type: application/json
Accept: application/json

{
  "requiredField1": "value1",
  "optionalField": "value",
  "nestedObject": {
    "field": "value"
  }
}

### Create {Entity} - Validation Error (Missing Required Fields)
POST {{baseUrl}}/{resources}
Content-Type: application/json
Accept: application/json

{
  "optionalField": "only"
}
```

### Step 3: Generate GET All File

Create `http/{resources}-get-all.http`:

```http
###
# Metadata header
###

@baseUrl = http://localhost:3001

### Get All {Entity}s
GET {{baseUrl}}/{resources}
Accept: application/json

### Get All {Entity}s - Empty Result
# Expects: []
GET {{baseUrl}}/{resources}
Accept: application/json
```

### Step 4: Generate GET by ID File

Create `http/{resources}-get-by-id.http`:

```http
###
# Metadata header
###

@baseUrl = http://localhost:3001
@{entity}Id = 00000000-0000-0000-0000-000000000001

### Get {Entity} by ID
GET {{baseUrl}}/{resources}/{{{{entity}Id}}
Accept: application/json

### Get {Entity} - Not Found (Invalid UUID)
GET {{baseUrl}}/{resources}/00000000-0000-0000-0000-000000000000
Accept: application/json
```

### Step 5: Generate PATCH/PUT File

Create `http/{resources}-patch.http`:

```http
###
# Metadata header
###

@baseUrl = http://localhost:3001
@{entity}Id = 00000000-0000-0000-0000-000000000001

### Update {Entity} - Partial Update
PATCH {{baseUrl}}/{resources}/{{{{entity}Id}}
Content-Type: application/json
Accept: application/json

{
  "firstName": "Updated Name"
}

### Update {Entity} - Full Update
PATCH {{baseUrl}}/{resources}/{{{{entity}Id}}
Content-Type: application/json
Accept: application/json

{
  "firstName": "Updated",
  "lastName": "Customer",
  "age": 30
}

### Update {Entity} - Not Found
PATCH {{baseUrl}}/{resources}/00000000-0000-0000-0000-000000000000
Content-Type: application/json
Accept: application/json

{
  "firstName": "Test"
}
```

### Step 6: Generate DELETE File

Create `http/{resources}-delete.http`:

```http
###
# Metadata header
###

@baseUrl = http://localhost:3001
@{entity}Id = 00000000-0000-0000-0000-000000000001

### Delete {Entity}
DELETE {{baseUrl}}/{resources}/{{{{entity}Id}}
Accept: application/json

### Delete {Entity} - Not Found
DELETE {{baseUrl}}/{resources}/00000000-0000-0000-0000-000000000000
Accept: application/json

### Delete {Entity} - Already Deleted
# Run after successful delete
DELETE {{baseUrl}}/{resources}/{{{{entity}Id}}
Accept: application/json
```

### Step 7: Generate Health Check

Create `http/health-get.http` if not exists:

```http
###
# App: base-node-fullstack
# File: http/health-get.http
# Version: 0.1.0
# Turn: {TURN_ID}
# Author: AI Coding Agent ({MODEL_NAME})
# Date: {ISO8601_DATE}
# Description: Health check endpoint test
###

@baseUrl = http://localhost:3001

### Health Check
GET {{baseUrl}}/health
Accept: application/json
```

### Step 8: Sample Payload Generation

For request bodies, generate realistic sample data:

| Field Type | Sample Value |
|------------|--------------|
| `firstName` | `"John"`, `"Jane"` |
| `lastName` | `"Doe"`, `"Smith"` |
| `email` | `"john.doe@example.com"` |
| `phone` | `"(555) 123-4567"` |
| `age` | `35` |
| `password` | `"SecurePass123!"` |
| `address.line1` | `"123 Main Street"` |
| `address.city` | `"New York"` |
| `address.state` | `"NY"` |
| `address.postalCode` | `"10001"` |
| `address.country` | `"USA"` |

### Step 9: Validation

Test each HTTP file manually:

1. Start API server: `cd app/api && pnpm run start:dev`
2. Execute requests in REST client
3. Verify expected responses

## Required Tests

HTTP files ARE the tests. Each file should cover:

| Scenario | Required |
|----------|----------|
| Happy path (valid data) | Yes |
| All fields populated | Yes |
| Minimal required fields | Yes |
| Validation error (missing required) | Yes |
| Not found (invalid ID) | Yes |
| Edge cases (empty arrays, nulls) | Recommended |

## Constraints

- **ONE FILE PER VERB**: Each HTTP method gets its own file. NEVER combine into single file.
- **Metadata header**: Every file starts with header comment block
- **Variable naming**: Use `@camelCase` for variables
- **Realistic data**: Sample payloads should be realistic, not `"string"` placeholders
- **UUID format**: Use valid UUID format for IDs
- **File count validation**: After generation, verify exactly 6 files exist (health + 5 CRUD operations)

## Non-Goals

- Authentication token management
- Environment-specific configurations
- Automated test execution
- Response validation assertions
