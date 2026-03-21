# Entity to CRUD Skill

Generate complete CRUD layer from any TypeORM/JPA entity.

## Supported Stacks

| Stack | Framework | Database | Pattern |
|-------|-----------|----------|---------|
| `typescript` | NestJS | TypeORM | Blocking |
| `java-reactive` | Spring WebFlux | R2DBC | Reactive (Mono/Flux) |
| `java-jpa` | Spring MVC | JPA | Blocking |

## Usage

```bash
# Auto-detect stack
/code-entity-to-crud Person

# Force stack type
/code-entity-to-crud Person --stack java-reactive

# Any entity name works
/code-entity-to-crud Organization
/code-entity-to-crud Customer
/code-entity-to-crud Product
```

## Scripts

The skill uses scripts to minimize token usage:

### detect-stack.sh

Detects project type from build files:
```bash
./scripts/detect-stack.sh /path/to/project
# Output: typescript | java-reactive | java-jpa
```

### generate-crud.js

Generates all CRUD files:
```bash
TURN_ID=T001 node ./scripts/generate-crud.js <EntityName> <stack-type> <project-root>
```

## Generated Files

### TypeScript/NestJS

```
app/api/src/<entity>/
├── dto/
│   ├── create-<entity>.dto.ts    # @IsString, @IsOptional, etc.
│   ├── update-<entity>.dto.ts    # PartialType
│   ├── <entity>-response.dto.ts  # @ApiProperty
│   └── index.ts
├── <entity>.service.ts           # CRUD + findAll pagination
├── <entity>.controller.ts        # REST endpoints + Swagger
├── <entity>.module.ts            # TypeORM registration
└── <entity>.service.spec.ts      # Unit tests

test/<entity>/
└── <entity>.e2e-spec.ts          # E2E tests
```

### Java Reactive (WebFlux + R2DBC)

```
src/main/java/<package>/<entity>/
├── dto/
│   ├── Create<Entity>Dto.java    # @NotNull, @Email, etc.
│   └── Update<Entity>Dto.java
├── <Entity>Repository.java       # R2dbcRepository
├── <Entity>Service.java          # Mono/Flux returns
├── <Entity>Controller.java       # @RestController + OpenAPI
└── <Entity>NotFoundException.java

src/test/java/<package>/<entity>/
├── <Entity>ServiceTest.java      # Unit tests with StepVerifier
└── <Entity>ControllerTest.java   # Integration tests with WebTestClient
```

### Java JPA (Spring MVC)

```
src/main/java/<package>/<entity>/
├── dto/
│   ├── Create<Entity>Dto.java
│   └── Update<Entity>Dto.java
├── <Entity>Repository.java       # JpaRepository
├── <Entity>Service.java          # Blocking returns
├── <Entity>Controller.java       # @RestController + OpenAPI
└── <Entity>NotFoundException.java

src/test/java/<package>/<entity>/
├── <Entity>ServiceTest.java      # Unit tests with Mockito
└── <Entity>ControllerTest.java   # Integration tests with MockMvc
```

## REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/<entities>` | Create new entity |
| GET | `/<entities>` | List with pagination |
| GET | `/<entities>/:id` | Get by UUID |
| PATCH | `/<entities>/:id` | Partial update |
| DELETE | `/<entities>/:id` | Delete |

## Pipeline Integration

```
┌─────────────────────┐     ┌──────────────────────┐     ┌───────────────┐
│ /schema-to-database │ ──▶ │ /code-entity-to-crud │ ──▶ │  REST API     │
│                     │     │                      │     │               │
│  JSON Schema        │     │  Entity → CRUD       │     │  Ready to use │
│  ↓                  │     │  ↓                   │     │               │
│  DDL + Entity       │     │  Service/Controller  │     │               │
└─────────────────────┘     └──────────────────────┘     └───────────────┘
```

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║  CRUD Generated: Person
╠══════════════════════════════════════════════════════════════╣
║  Stack: typescript
║  Output: app/api/src/person
║
║  Files Created:
║    ├── dto/create-person.dto.ts
║    ├── dto/update-person.dto.ts
║    ├── dto/person-response.dto.ts
║    ├── person.service.ts
║    ├── person.controller.ts
║    └── person.module.ts
║
║  REST Endpoints:
║    POST   /persons        Create
║    GET    /persons        List
║    GET    /persons/:id    Get by ID
║    PATCH  /persons/:id    Update
║    DELETE /persons/:id    Delete
║
║  Next: Add PersonModule to AppModule imports
╚══════════════════════════════════════════════════════════════╝
```
