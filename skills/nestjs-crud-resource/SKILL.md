---
name: nestjs-crud-resource
description: Generate NestJS CRUD module with controller, service, and DTOs from DSL backend specification. Use when creating or updating backend API resources.
---

# NestJS CRUD Resource

Generate a complete NestJS resource module from `app-dsl/backend/` and `app-dsl/models/api/` specifications.

## Purpose

Create:
- NestJS module with proper exports and imports
- Controller with CRUD route handlers
- Service with business logic
- DTOs with class-validator decorations
- Entity types for type safety

## Use When

- Creating a new API resource
- Adding endpoints to existing resource
- Regenerating DTOs after model changes

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `parsed_backend` | Parsed backend specification from `dsl-model-interpreter` | **Yes** |
| `parsed_api_model` | Parsed API model from `dsl-model-interpreter` | **Yes** |
| `dsl_context` | DSL context with path metadata from orchestrator | **Yes** |
| `entity` | PascalCase entity name (e.g., `Customer`) | **Yes** |
| `resource` | Plural kebab-case (e.g., `customers`) | **Yes** |

### Input Contract

This skill receives **parsed content** from the `dsl-model-interpreter`, not raw file paths.

**Expected `parsed_backend` structure:**
```json
{
  "service": {
    "id": "customer-service",
    "namespace": "customer"
  },
  "endpoints": {
    "createCustomer": {
      "method": "POST",
      "path": "/api/customers",
      "requestModelRef": "...",
      "responseModelRef": "..."
    }
  }
}
```

**Expected `parsed_api_model` structure:**
```json
{
  "kind": "api-model",
  "models": {
    "CreateCustomerRequest": { "fields": {...} },
    "CustomerResponse": { "fields": {...} }
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

| Output | Location |
|--------|----------|
| Module | `app/api/src/{entity}/{entity}.module.ts` |
| Controller | `app/api/src/{entity}/{entity}.controller.ts` |
| Service | `app/api/src/{entity}/{entity}.service.ts` |
| Create DTO | `app/api/src/{entity}/dto/create-{entity}.dto.ts` |
| Update DTO | `app/api/src/{entity}/dto/update-{entity}.dto.ts` |
| Entity | `app/api/src/{entity}/entities/{entity}.entity.ts` |

## Dependencies

| Skill | Purpose |
|-------|---------|
| `dsl-model-interpreter` | Parse API model YAML |
| `prisma-persistence` | Must run first to ensure Prisma client types exist |

## Repository Patterns Reproduced

### Directory Structure

```
app/api/src/{entity}/
  {entity}.module.ts
  {entity}.controller.ts
  {entity}.service.ts
  dto/
    create-{entity}.dto.ts
    update-{entity}.dto.ts
  entities/
    {entity}.entity.ts
```

### Module Pattern

```typescript
@Module({
  imports: [],
  controllers: [{Entity}Controller],
  providers: [{Entity}Service, PrismaService],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

### Controller Pattern

```typescript
@Controller('{resources}')
export class {Entity}Controller {
  constructor(private readonly {entity}Service: {Entity}Service) {}

  @Post()
  create(@Body() createDto: Create{Entity}Dto) {
    return this.{entity}Service.create(createDto);
  }

  @Get()
  findAll() {
    return this.{entity}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.{entity}Service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Update{Entity}Dto) {
    return this.{entity}Service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.{entity}Service.remove(id);
  }
}
```

### Service Pattern

```typescript
@Injectable()
export class {Entity}Service {
  constructor(private prisma: PrismaService) {}

  async create(data: Create{Entity}Dto) {
    return this.prisma.{entity}.create({ data });
  }

  async findAll() {
    return this.prisma.{entity}.findMany();
  }

  async findOne(id: string) {
    return this.prisma.{entity}.findUnique({ where: { id } });
  }

  async update(id: string, data: Update{Entity}Dto) {
    return this.prisma.{entity}.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.{entity}.delete({ where: { id } });
  }
}
```

### DTO Pattern

```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Create{Entity}Dto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleInitial?: string;

  @IsNumber()
  age: number;

  @ValidateNested()
  @Type(() => AddressDto)
  homeAddress: AddressDto;
}
```

## Instructions

### Step 1: Use Parsed DSL Content

**Receive parsed content from the orchestrator** (via `dsl-model-interpreter` output):

**From `parsed_backend`:**
```json
{
  "endpoints": {
    "createCustomer": { "method": "POST", "path": "/api/customers" },
    "getCustomer": { "method": "GET", "path": "/api/customers/{id}" }
  }
}
```

**From `parsed_api_model`:**
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

Extract:
- Endpoints (method, path, request/response models)
- Request model fields (name, type, required)
- Response model fields

**Note:** Do NOT read DSL files directly. The orchestrator provides pre-parsed content.

### Step 2: Create Module Directory

```bash
mkdir -p app/api/src/{entity}/{dto,entities}
```

### Step 3: Generate Entity Type

From persistence or API response model, create entity interface:

```typescript
// app/api/src/{entity}/entities/{entity}.entity.ts
export interface {Entity} {
  id: string;
  firstName: string;
  middleInitial?: string;
  // ... all fields
}
```

### Step 4: Generate DTOs

**Create DTO** - From `CreateCustomerRequest` model:

Map DSL types to decorators:

| DSL Type | Decorator |
|----------|-----------|
| `string` + `required: true` | `@IsString() @IsNotEmpty()` |
| `string` + `required: false` | `@IsString() @IsOptional()` |
| `number` | `@IsNumber()` |
| `ref` (object) | `@ValidateNested() @Type(() => NestedDto)` |
| `array` | `@IsArray() @ValidateNested({ each: true })` |

**Update DTO** - Use `PartialType(Create{Entity}Dto)` from `@nestjs/mapped-types`:

```typescript
import { PartialType } from '@nestjs/mapped-types';
export class Update{Entity}Dto extends PartialType(Create{Entity}Dto) {}
```

### Step 5: Generate Service

Create service with Prisma operations:

```typescript
@Injectable()
export class {Entity}Service {
  constructor(private prisma: PrismaService) {}
  // CRUD methods
}
```

**Gotcha**: Service method names must match Prisma model name (camelCase, singular).

### Step 6: Generate Controller

Create controller with route decorators:

- `@Post()` for create
- `@Get()` for findAll
- `@Get(':id')` for findOne
- `@Patch(':id')` or `@Put(':id')` for update
- `@Delete(':id')` for remove

**Gotcha**: Route path uses plural resource name, not entity name.

### Step 7: Generate Module

Wire up the module:

```typescript
@Module({
  controllers: [{Entity}Controller],
  providers: [{Entity}Service, PrismaService],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

### Step 8: Register Module

Add import to `app.module.ts`:

```typescript
import { {Entity}Module } from './{entity}/{entity}.module';

@Module({
  imports: [
    // ... existing imports
    {Entity}Module,
  ],
})
export class AppModule {}
```

### Step 9: Add Metadata Headers

Every generated file must start with:

```typescript
/**
 * App: base-node-fullstack
 * Package: api
 * File: {filename}
 * Version: 0.1.0
 * Turns: {TURN_ID}
 * Author: AI Coding Agent ({MODEL_NAME})
 * Date: {ISO8601_DATE}
 * Exports: {ExportedClasses}
 * Description: {description}
 * Log:
 * {TURN_ID}, 0.1.0, {DATE}, {TIME}, {MODEL_NAME}
 */
```

### Step 10: Validation Loop

```bash
cd app/api
pnpm run build
pnpm run test
```

Fix any errors before completing.

## Required Tests

| Test File | Coverage |
|-----------|----------|
| `test/{entity}.controller.spec.ts` | Route handling, validation errors, success responses |
| `test/{entity}.service.spec.ts` | CRUD operations, error handling |
| `test/{entity}/{entity}.dto.spec.ts` | DTO validation rules |

**Minimum test scenarios:**

1. Create - success with valid data
2. Create - fail with missing required fields
3. FindAll - returns array
4. FindOne - success with valid ID
5. FindOne - fail with invalid ID (404)
6. Update - success with valid data
7. Delete - success removes record

## Constraints

- **Prisma required**: Service uses PrismaService, Prisma client must be generated first
- **class-validator**: All DTOs use class-validator decorators
- **ValidationPipe**: App must have global ValidationPipe enabled
- **No business logic in controller**: All logic goes in service

## Non-Goals

- Authentication/authorization decorators
- Custom validation logic beyond class-validator
- Complex query operations (filtering, pagination)
- File upload handling
