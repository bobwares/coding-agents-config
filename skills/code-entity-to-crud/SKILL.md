# Entity to CRUD

Generate complete CRUD (Module, Service, Controller, DTOs) from any TypeORM/JPA entity.

**Supports:** TypeScript/NestJS, Java/Spring Reactive (WebFlux + R2DBC), Java/Spring JPA

## Trigger

Use when user wants to:
- Generate CRUD for an entity
- Create REST API endpoints from entity
- Build service/controller layer
- `/code-entity-to-crud <EntityName>`

## Usage

```bash
/code-entity-to-crud Person
/code-entity-to-crud Organization
/code-entity-to-crud Customer --stack java-reactive
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `<EntityName>` | PascalCase entity name | Required |
| `--stack <type>` | Force stack: `typescript`, `java-reactive`, `java-jpa` | Auto-detect |
| `--output <dir>` | Custom output directory | Auto |

## Execution

**IMPORTANT:** This skill uses scripts to generate code. Execute in order:

### Step 1: Detect Stack

```bash
SKILL_DIR="${HOME}/.claude/skills/code-entity-to-crud"
chmod +x "$SKILL_DIR/scripts/detect-stack.sh"
STACK=$("$SKILL_DIR/scripts/detect-stack.sh" .)
echo "Detected stack: $STACK"
```

### Step 2: Generate CRUD

```bash
TURN_ID="${TURN_ID:-T000}" node "$SKILL_DIR/scripts/generate-crud.js" <EntityName> "$STACK" .
```

The script outputs JSON with results after `--- OUTPUT ---`.

### Step 3: Report Results

Parse the JSON output and display:

```
╔══════════════════════════════════════════════════════════════╗
║  CRUD Generated: <EntityName>
╠══════════════════════════════════════════════════════════════╣
║  Stack: <detected-stack>
║  Output: <output-directory>
║
║  Files Created:
║    ├── dto/create-<entity>.dto.ts
║    ├── dto/update-<entity>.dto.ts
║    ├── dto/<entity>-response.dto.ts
║    ├── <entity>.service.ts
║    ├── <entity>.controller.ts
║    ├── <entity>.module.ts
║    └── <entity>.service.spec.ts       (unit tests)
║
║  Test Files:
║    └── test/<entity>/<entity>.e2e-spec.ts  (e2e tests)
║
║  REST Endpoints:
║    POST   /<entities>        Create
║    GET    /<entities>        List (paginated)
║    GET    /<entities>/:id    Get by ID
║    PATCH  /<entities>/:id    Update
║    DELETE /<entities>/:id    Delete
╚══════════════════════════════════════════════════════════════╝
```

### Step 4: Integration Instructions

**For TypeScript/NestJS:**
```
Add to app.module.ts:
  import { <Entity>Module } from './<entity>/<entity>.module';
  @Module({ imports: [..., <Entity>Module] })
```

**For Java:**
```
Component scanning should auto-detect. If not:
  @ComponentScan(basePackages = {"com.example.app.<entity>"})
```

## Stack Detection Logic

| Indicator | Stack |
|-----------|-------|
| `package.json` + `@nestjs/core` | `typescript` |
| `spring-boot-starter-webflux` or `r2dbc` | `java-reactive` |
| `spring-boot-starter-web` + `spring-data-jpa` | `java-jpa` |
| Java project without reactive | `java-reactive` (default) |

## Generated Code Features

### TypeScript/NestJS
- DTOs with `class-validator` decorators
- Swagger/OpenAPI decorators
- TypeORM repository injection
- Pagination support
- UUID validation
- **Unit tests** for service with mocked repository
- **E2E tests** for controller endpoints

### Java Reactive (WebFlux + R2DBC)
- `Mono<T>` / `Flux<T>` return types
- R2DBC repository
- Jakarta validation
- Lombok `@Data` DTOs
- OpenAPI annotations
- **Unit tests** with `StepVerifier` for reactive testing
- **Integration tests** with `WebTestClient`

### Java JPA (Spring MVC)
- Blocking service methods
- JPA repository with `Page<T>`
- Jakarta validation
- Lombok `@Data` DTOs
- OpenAPI annotations
- **Unit tests** with Mockito and AssertJ
- **Integration tests** with `MockMvc`

## Generated Test Files

### TypeScript/NestJS
```
app/api/src/<entity>/
├── <entity>.service.spec.ts     # Unit tests for service
test/<entity>/
└── <entity>.e2e-spec.ts         # E2E tests for controller
```

### Java (Both Reactive and JPA)
```
src/test/java/<package>/<entity>/
├── <Entity>ServiceTest.java     # Unit tests for service
└── <Entity>ControllerTest.java  # Integration tests for controller
```

## Test Coverage

| Test Type | Coverage |
|-----------|----------|
| Unit      | Service create, findAll, findOne, update, remove, count |
| E2E       | All REST endpoints: POST, GET (list), GET (by id), PATCH, DELETE |
| Error     | 404 not found, 400 validation errors |
| Edge      | Pagination, UUID validation |

## File Metadata

All generated files include headers:
```
@version 1.0.0
@turns [${TURN_ID}]
@generated ${DATE} by AI Coding Agent
```

## Dependencies Check

After generation, verify dependencies:

**TypeScript:**
```bash
pnpm add class-validator class-transformer @nestjs/swagger @nestjs/typeorm typeorm
```

**Java:**
```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
</dependency>
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
</dependency>
```
