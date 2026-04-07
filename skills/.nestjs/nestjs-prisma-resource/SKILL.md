---
name: nestjs-prisma-resource
description: Generate a complete NestJS CRUD resource backed by Prisma from an input schema. Creates the same practical artifact set as `nest g resource`, but with deterministic schema-driven DTOs, service, controller, module, Prisma integration, and required package.json updates.
version: 0.1.0
author: Bobwares
tags:
  - nestjs
  - prisma
  - crud
  - schema
  - codegen
  - npm
---

# nestjs-prisma-resource

## Purpose

This skill generates a complete **NestJS CRUD resource** from a provided schema and integrates it with **Prisma**.

It is designed to replace the interactive and limited behavior of:

```bash
nest g resource <entity>
```

with a deterministic, schema-driven workflow that:

1. Creates the same practical CRUD structure
2. Populates DTOs from schema fields
3. Connects the service to Prisma
4. Updates `package.json` with required dependencies
5. Creates or updates Prisma infrastructure


## When To Use

Use this skill when:

* You have an entity schema and want a full **NestJS + Prisma CRUD resource**
* You want DTOs generated from actual fields rather than empty placeholders
* You want a repeatable code generation workflow suitable for agent pipelines
* You want the LLM to orchestrate file creation and patching rather than hand-write all boilerplate

## When Not To Use

Do not use this skill when:

* The target project is not a **NestJS** application
* The project does not use or should not use **Prisma**
* The schema is too incomplete to infer a stable API shape
* The user only wants a plain controller, service, or module without persistence integration
* The project already has a different repository or ORM abstraction that must be preserved

## Inputs

### Required Inputs

#### `entity_name`

The singular PascalCase or plain-name entity identifier.

Examples:

* `Customer`
* `customer`
* `Person`

#### `schema`

A field-level schema for the entity.

Supported conceptual forms:

* YAML-like field list
* JSON object
* simplified DSL
* Prisma-like field description
* SQL-derived normalized field list

Example:

```yaml
entity: Customer
fields:
  - name: id
    type: int
    required: true
    id: true
    generated: true
  - name: firstName
    type: string
    required: true
  - name: lastName
    type: string
    required: true
  - name: age
    type: int
    required: false
  - name: phone
    type: string
    required: true
  - name: password
    type: string
    required: true
```

#### `target_project_root`

Filesystem root of the NestJS app.

Examples:

```text
apps/api
.
```

### Optional Inputs

#### `route_name`

Explicit route override.

Default: kebab-case singular version of entity name.

#### `plural_name`

Optional plural override.

Examples:

* `customers`
* `people`

#### `database_provider`

Supported values:

* `postgresql`
* `mysql`
* `sqlite`
* `sqlserver`

Default:

```text
postgresql
```

#### `id_strategy`

Supported values:

* `autoincrement-int`
* `uuid`

Default:

```text
autoincrement-int
```

#### `generate_tests`

Supported values:

* `true`
* `false`

Default:

```text
false
```

#### `patch_app_module`

Supported values:

* `true`
* `false`

Default:

```text
true
```

#### `patch_main_ts_validation`

Supported values:

* `true`
* `false`

Default:

```text
true
```

#### `run_prisma_generate`

Supported values:

* `true`
* `false`

Default:

```text
true
```

#### `run_prisma_migrate`

Supported values:

* `true`
* `false`

Default:

```text
false
```

#### `migration_name`

Optional migration name when migrations are requested.

## Expected Outputs

This skill generates a complete CRUD resource with Prisma integration.

### Primary Resource Files

For entity `customer`, generate:

```text
src/customer/customer.module.ts
src/customer/customer.controller.ts
src/customer/customer.service.ts
src/customer/dto/create-customer.dto.ts
src/customer/dto/update-customer.dto.ts
src/customer/entities/customer.entity.ts
```

### Prisma Infrastructure Files

If missing, create:

```text
src/prisma/prisma.module.ts
src/prisma/prisma.service.ts
```

### Prisma Schema Updates

Create or patch:

```text
prisma/schema.prisma
```

### Project Integration Updates

Patch as needed:

```text
src/app.module.ts
src/main.ts
package.json
.env
```

## Generated API Shape

The generated controller should expose standard REST CRUD endpoints.

| Method | Route | Service Method |
| --- | --- | --- |
| `POST` | `/<route>` | `create` |
| `GET` | `/<route>` | `findAll` |
| `GET` | `/<route>/:id` | `findOne` |
| `PATCH` | `/<route>/:id` | `update` |
| `DELETE` | `/<route>/:id` | `remove` |

## Behavior

### High-Level Flow

1. Parse the input schema
2. Normalize field metadata
3. Derive names and paths
4. Ensure required npm dependencies exist
5. Ensure Prisma infrastructure exists
6. Generate CRUD files
7. Patch `AppModule`
8. Patch global validation in `main.ts`
9. Patch `prisma/schema.prisma`
10. Optionally run Prisma commands

### Naming Rules

#### Entity Class Name

Use PascalCase singular.

#### File and Folder Names

Use kebab-case singular.

#### DTO Names

Use standard Nest conventions.

#### Controller Route

Use singular route name unless explicitly overridden.

## Schema Normalization Rules

Normalize all input schemas into an intermediate model before generation.

### Canonical Internal Model

```json
{
  "entityName": "Customer",
  "entityNameCamel": "customer",
  "entityNameKebab": "customer",
  "entityNamePlural": "customers",
  "routeName": "customer",
  "fields": [
    {
      "name": "id",
      "tsType": "number",
      "prismaType": "Int",
      "required": true,
      "isId": true,
      "isGenerated": true,
      "isUnique": true,
      "includeInCreateDto": false,
      "includeInUpdateDto": false
    },
    {
      "name": "firstName",
      "tsType": "string",
      "prismaType": "String",
      "required": true,
      "includeInCreateDto": true,
      "includeInUpdateDto": true
    }
  ]
}
```

### Field Mapping Rules

| Input Type | TypeScript | Prisma |
| --- | --- | --- |
| `string` | `string` | `String` |
| `text` | `string` | `String` |
| `int` | `number` | `Int` |
| `integer` | `number` | `Int` |
| `float` | `number` | `Float` |
| `decimal` | `number` | `Decimal` |
| `boolean` | `boolean` | `Boolean` |
| `date` | `Date` | `DateTime` |
| `datetime` | `Date` | `DateTime` |
| `json` | `Record<string, unknown>` | `Json` |
| `uuid` | `string` | `String` |

### Required vs Optional

* Required fields become non-optional in `CreateDto`
* Optional fields become optional in `CreateDto`
* `UpdateDto` always extends `PartialType(CreateDto)`

### ID Rules

* Generated `id` fields are excluded from create and update DTOs
* UUID IDs may be excluded from create DTOs unless explicitly marked client-supplied

## Validation Rules

Generate `class-validator` decorators where possible.

### Suggested Mappings

| TypeScript Type | Decorator |
| --- | --- |
| `string` | `@IsString()` |
| integer `number` | `@IsInt()` |
| float `number` | `@IsNumber()` |
| `boolean` | `@IsBoolean()` |
| `Date` | `@IsDateString()` |
| optional field | `@IsOptional()` |

## Files To Generate

### `src/<entity>/<entity>.controller.ts`

Responsibilities:

* define REST routes
* inject service
* call service CRUD methods
* accept DTOs

### `src/<entity>/<entity>.service.ts`

Responsibilities:

* inject `PrismaService`
* implement CRUD operations
* perform `findUnique`, `findMany`, `create`, `update`, `delete`
* throw `NotFoundException` when record does not exist

### `src/<entity>/<entity>.module.ts`

Responsibilities:

* register controller
* register service
* import `PrismaModule`

### `src/<entity>/dto/create-<entity>.dto.ts`

Responsibilities:

* define schema-backed create DTO
* apply validation decorators
* exclude generated ID fields

### `src/<entity>/dto/update-<entity>.dto.ts`

Responsibilities:

* extend `PartialType(CreateDto)`

### `src/<entity>/entities/<entity>.entity.ts`

For Prisma-backed projects, this can be a placeholder or exported interface until a future revision adds richer output.

Suggested default:

```ts
export class CustomerEntity {}
```

## Prisma Infrastructure

### `src/prisma/prisma.service.ts`

If missing, generate a `PrismaService` extending `PrismaClient` and implementing `OnModuleInit`.

### `src/prisma/prisma.module.ts`

If missing, generate a global `PrismaModule` that provides and exports `PrismaService`.

## Prisma Schema Rules

Patch `prisma/schema.prisma` safely.

### Ensure Generator Exists

```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Ensure Datasource Exists

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Append or Update Entity Model

Example:

```prisma
model Customer {
  id        Int     @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
  phone     String
  password  String
}
```

### Patch Strategy

* If model does not exist, append it
* If model exists, do not blindly overwrite
* If model exists and differs materially, stop and emit a conflict report

## `package.json` Update Rules

### Required Runtime Dependencies

Ensure these exist:

```json
{
  "@prisma/client": "latest",
  "class-transformer": "latest",
  "class-validator": "latest"
}
```

### Required Dev Dependencies

Ensure this exists:

```json
{
  "prisma": "latest"
}
```

### Package Manager

Use **npm** only.

Install commands:

```bash
npm install @prisma/client class-validator class-transformer
npm install -D prisma
```

## `main.ts` Patch Rules

If validation patching is enabled, ensure:

```ts
import { ValidationPipe } from '@nestjs/common';
```

and:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## `app.module.ts` Patch Rules

If enabled:

1. Import generated feature module
2. Add it to `imports`
3. Do not duplicate existing imports

## Commands To Run

### Required Commands

```bash
npm install
npx prisma generate
```

### Optional Commands

```bash
npx prisma migrate dev --name <migration_name>
npm run format
npm run lint
npm run test
```

## Conflict Handling

Stop and report conflicts instead of overwriting blindly when:

* target entity folder already exists and contains non-generated code
* Prisma model already exists and differs materially
* `AppModule` cannot be patched safely
* `main.ts` uses conflicting bootstrap logic

When conflict occurs, provide:

1. file path
2. issue summary
3. proposed patch
4. whether safe append, safe replace, or manual review is required

## Error Handling

Return a structured failure summary when generation cannot proceed.

Example:

```json
{
  "entity_name": "Customer",
  "failed_step": "patch_prisma_schema",
  "file": "prisma/schema.prisma",
  "reason": "Existing Customer model differs from requested schema",
  "recommended_fix": "Perform merge review instead of overwrite"
}
```

## Output Summary Format

After successful generation, report:

1. entity generated
2. files created
3. files modified
4. npm dependencies added
5. Prisma commands run
6. remaining manual tasks

## Example Invocation

### Example Input

```yaml
entity_name: Customer
target_project_root: .
database_provider: postgresql
id_strategy: autoincrement-int
patch_app_module: true
patch_main_ts_validation: true
run_prisma_generate: true
run_prisma_migrate: false
schema:
  fields:
    - name: id
      type: int
      id: true
      generated: true
      required: true
    - name: firstName
      type: string
      required: true
    - name: lastName
      type: string
      required: true
    - name: age
      type: int
      required: false
    - name: phone
      type: string
      required: true
    - name: password
      type: string
      required: true
```

### Expected Outcome

Generated:

```text
src/customer/customer.controller.ts
src/customer/customer.service.ts
src/customer/customer.module.ts
src/customer/dto/create-customer.dto.ts
src/customer/dto/update-customer.dto.ts
src/customer/entities/customer.entity.ts
src/prisma/prisma.module.ts
src/prisma/prisma.service.ts
```

Patched:

```text
src/app.module.ts
src/main.ts
prisma/schema.prisma
package.json
```

Installed:

```bash
npm install @prisma/client class-validator class-transformer
npm install -D prisma
```

Ran:

```bash
npx prisma generate
```

## Implementation Notes For Future Python Generator

This skill is designed so a later Python generator can consume the normalized schema model and emit deterministic files.

The LLM should eventually focus on:

* schema interpretation
* conflict resolution
* orchestration
* patch planning

The Python generator should eventually own:

* boilerplate rendering
* import generation
* CRUD method scaffolding
* DTO class generation
* Prisma model rendering

## Minimum Acceptance Criteria

A successful run must:

1. Create a compilable NestJS feature module
2. Create a Prisma-backed service
3. Create DTOs from schema fields
4. Patch `package.json` dependencies
5. Ensure Prisma infrastructure exists
6. Register the feature in `AppModule`
7. Enable validation if not already enabled
8. Produce a clear change summary

## Unit Test Requirements

When `generate_tests: true`, generate unit tests for the service and controller.

### Test File Structure

```text
src/<entity>/<entity>.controller.spec.ts
src/<entity>/<entity>.service.spec.ts
```

### Service Unit Test Requirements

File: `src/<entity>/<entity>.service.spec.ts`

Must cover:

| Method    | Test Cases                                                                           |
|-----------|--------------------------------------------------------------------------------------|
| `create`  | Creates entity with valid DTO; Returns created entity with generated ID              |
| `findAll` | Returns array of entities; Returns empty array when no entities exist                |
| `findOne` | Returns entity when found; Throws `NotFoundException` when not found                 |
| `update`  | Updates entity with valid DTO; Throws `NotFoundException` when entity does not exist |
| `remove`  | Deletes entity; Throws `NotFoundException` when entity does not exist                |

#### Service Test Template

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { <Entity>Service } from './<entity>.service';
import { PrismaService } from '../prisma/prisma.service';
import { Create<Entity>Dto } from './dto/create-<entity>.dto';
import { Update<Entity>Dto } from './dto/update-<entity>.dto';

describe('<Entity>Service', () => {
  let service: <Entity>Service;
  let prisma: PrismaService;

  const mockPrismaService = {
    <entity>: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        <Entity>Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<<Entity>Service>(<Entity>Service);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const dto: Create<Entity>Dto = { /* valid fields */ };
      const expected = { id: 1, ...dto };
      mockPrismaService.<entity>.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.<entity>.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of entities', async () => {
      const expected = [{ id: 1 }, { id: 2 }];
      mockPrismaService.<entity>.findMany.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
    });

    it('should return empty array when no entities exist', async () => {
      mockPrismaService.<entity>.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return entity when found', async () => {
      const expected = { id: 1 };
      mockPrismaService.<entity>.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.<entity>.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update entity with valid DTO', async () => {
      const dto: Update<Entity>Dto = { /* valid fields */ };
      const existing = { id: 1 };
      const expected = { id: 1, ...dto };
      mockPrismaService.<entity>.findUnique.mockResolvedValue(existing);
      mockPrismaService.<entity>.update.mockResolvedValue(expected);

      const result = await service.update(1, dto);

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      mockPrismaService.<entity>.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete entity', async () => {
      const existing = { id: 1 };
      mockPrismaService.<entity>.findUnique.mockResolvedValue(existing);
      mockPrismaService.<entity>.delete.mockResolvedValue(existing);

      const result = await service.remove(1);

      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      mockPrismaService.<entity>.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Controller Unit Test Requirements

File: `src/<entity>/<entity>.controller.spec.ts`

Must cover:

| Method | Test Cases |
| --- | --- |
| `create` | Calls service.create with DTO; Returns created entity |
| `findAll` | Calls service.findAll; Returns array of entities |
| `findOne` | Calls service.findOne with ID; Returns entity |
| `update` | Calls service.update with ID and DTO; Returns updated entity |
| `remove` | Calls service.remove with ID; Returns removed entity |

#### Controller Test Template

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { <Entity>Controller } from './<entity>.controller';
import { <Entity>Service } from './<entity>.service';
import { Create<Entity>Dto } from './dto/create-<entity>.dto';
import { Update<Entity>Dto } from './dto/update-<entity>.dto';

describe('<Entity>Controller', () => {
  let controller: <Entity>Controller;
  let service: <Entity>Service;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [<Entity>Controller],
      providers: [{ provide: <Entity>Service, useValue: mockService }],
    }).compile();

    controller = module.get<<Entity>Controller>(<Entity>Controller);
    service = module.get<<Entity>Service>(<Entity>Service);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const dto: Create<Entity>Dto = { /* valid fields */ };
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return array of entities', async () => {
      const expected = [{ id: 1 }, { id: 2 }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return entity by ID', async () => {
      const expected = { id: 1 };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('1');

      expect(result).toEqual(expected);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update entity', async () => {
      const dto: Update<Entity>Dto = { /* valid fields */ };
      const expected = { id: 1, ...dto };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update('1', dto);

      expect(result).toEqual(expected);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove entity', async () => {
      const expected = { id: 1 };
      mockService.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');

      expect(result).toEqual(expected);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
```

## E2E Test Requirements

When `generate_tests: true`, generate e2e tests for the resource endpoints.

### E2E Test File Structure

```text
test/<entity>.e2e-spec.ts
```

### E2E Test Requirements

File: `test/<entity>.e2e-spec.ts`

Must cover:

| Endpoint | Test Cases |
| --- | --- |
| `POST /<route>` | Creates entity with valid body (201); Rejects invalid body (400) |
| `GET /<route>` | Returns array of entities (200) |
| `GET /<route>/:id` | Returns entity when found (200); Returns 404 when not found |
| `PATCH /<route>/:id` | Updates entity (200); Returns 404 when not found; Rejects invalid body (400) |
| `DELETE /<route>/:id` | Deletes entity (200); Returns 404 when not found |

### E2E Test Template

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('<Entity>Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.<entity>.deleteMany();
  });

  describe('POST /<route>', () => {
    it('should create entity with valid body', async () => {
      const dto = { /* valid fields */ };

      const response = await request(app.getHttpServer())
        .post('/<route>')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.fieldName).toBe(dto.fieldName);
    });

    it('should reject invalid body', async () => {
      const invalidDto = { /* missing required fields */ };

      await request(app.getHttpServer())
        .post('/<route>')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /<route>', () => {
    it('should return array of entities', async () => {
      // Seed test data
      await prisma.<entity>.createMany({
        data: [{ /* entity 1 */ }, { /* entity 2 */ }],
      });

      const response = await request(app.getHttpServer())
        .get('/<route>')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /<route>/:id', () => {
    it('should return entity when found', async () => {
      const entity = await prisma.<entity>.create({
        data: { /* valid fields */ },
      });

      const response = await request(app.getHttpServer())
        .get(`/<route>/${entity.id}`)
        .expect(200);

      expect(response.body.id).toBe(entity.id);
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer())
        .get('/<route>/99999')
        .expect(404);
    });
  });

  describe('PATCH /<route>/:id', () => {
    it('should update entity', async () => {
      const entity = await prisma.<entity>.create({
        data: { /* valid fields */ },
      });
      const updateDto = { /* updated fields */ };

      const response = await request(app.getHttpServer())
        .patch(`/<route>/${entity.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.updatedField).toBe(updateDto.updatedField);
    });

    it('should return 404 when entity not found', async () => {
      await request(app.getHttpServer())
        .patch('/<route>/99999')
        .send({ /* valid update */ })
        .expect(404);
    });

    it('should reject invalid body', async () => {
      const entity = await prisma.<entity>.create({
        data: { /* valid fields */ },
      });

      await request(app.getHttpServer())
        .patch(`/<route>/${entity.id}`)
        .send({ invalidField: 'not allowed' })
        .expect(400);
    });
  });

  describe('DELETE /<route>/:id', () => {
    it('should delete entity', async () => {
      const entity = await prisma.<entity>.create({
        data: { /* valid fields */ },
      });

      await request(app.getHttpServer())
        .delete(`/<route>/${entity.id}`)
        .expect(200);

      const deleted = await prisma.<entity>.findUnique({
        where: { id: entity.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when entity not found', async () => {
      await request(app.getHttpServer())
        .delete('/<route>/99999')
        .expect(404);
    });
  });
});
```

## Test Dependencies

When `generate_tests: true`, ensure these dev dependencies exist:

```json
{
  "@nestjs/testing": "latest",
  "jest": "latest",
  "@types/jest": "latest",
  "supertest": "latest",
  "@types/supertest": "latest",
  "ts-jest": "latest"
}
```

Install command:

```bash
npm install -D @nestjs/testing jest @types/jest supertest @types/supertest ts-jest
```

## Test Configuration

Ensure `jest.config.js` or `package.json` jest config includes:

```js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
```

For e2e tests, ensure `test/jest-e2e.json` exists:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

## Test Execution Commands

```bash
# Run unit tests
npm run test

# Run unit tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Test Output Files Summary

When `generate_tests: true`, these additional files are created:

```text
src/<entity>/<entity>.controller.spec.ts
src/<entity>/<entity>.service.spec.ts
test/<entity>.e2e-spec.ts
```

## Test Acceptance Criteria

Generated tests must:

1. Compile without errors
2. Pass when run against generated service and controller
3. Use Jest mocking for unit tests
4. Use supertest for e2e tests
5. Cover all CRUD operations
6. Test both success and error cases
7. Clean up test data in e2e tests

## Future Enhancements

Planned later improvements may include:

* relation support
* enum support
* pagination
* filtering and sorting query DTOs
* Swagger decorators
* secure field hashing hooks
* repository abstraction layer
* OpenAPI-first schema input
* Python/Jinja deterministic renderer
