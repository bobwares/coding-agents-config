---
name: test-implementation-sync
description: Ensure unit tests are synchronized with actual service/DTO implementations. Use when generating tests alongside code or auditing test/implementation alignment.
---

# Test-Implementation Sync

Prevent test-implementation misalignment errors by enforcing consistency between generated tests and their target implementations.

## Purpose

Eliminate these error categories:
- **TS2339**: Method/property doesn't exist on type (tests calling non-existent methods)
- **TS2345**: Argument type mismatch (DTOs with wrong field names)
- **TS2554**: Wrong number of arguments (missing required parameters)
- **TS2564**: Property not initialized (DTOs missing `!` assertions)
- **TS2559**: Object has no properties in common with expected type

## Use When

- Generating unit tests for services, controllers, or DTOs
- Auditing existing tests for implementation drift
- After modifying service method signatures
- After updating DTO field structures
- After changing Prisma enum definitions

## Critical Rules

### Rule 1: Read Before Write

**NEVER generate a test file without first reading:**

1. The target service/controller implementation
2. All DTO classes the service uses
3. The Prisma schema for enum values

```typescript
// WRONG: Assume method exists
const result = await service.validateUser(email, password);

// RIGHT: First read auth.service.ts to confirm method signature
// If service has login() and register(), test those
const result = await service.login(loginDto);
```

### Rule 2: Extract Method Signatures from Source

**Before writing any test**, extract the actual method signatures:

```bash
# Find all public methods in a service
grep -E "^\s+async\s+\w+\(" src/modules/auth/auth.service.ts
```

Expected output tells you what methods exist:
```
async register(dto: RegisterDto): Promise<AuthResponseDto>
async login(dto: LoginDto): Promise<AuthResponseDto>
async refreshToken(token: string): Promise<AuthResponseDto>
```

**Test file must only test methods that exist.**

### Rule 3: Match DTO Field Names Exactly

**WRONG** - Using simplified/assumed field names:
```typescript
const createDto = {
  name: 'John Doe',        // WRONG: assumed single name field
  email: 'john@example.com',
};
```

**RIGHT** - Read the actual DTO first:
```typescript
// After reading CreateCustomerDto, found: firstName, lastName, email
const createDto: CreateCustomerDto = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
};
```

### Rule 4: Match Required Parameters

**WRONG** - Omitting required parameters:
```typescript
const result = await service.findAll();  // Missing pagination, search
```

**RIGHT** - Check method signature and include all required args:
```typescript
// Service signature: findAll(pagination: PaginationDto, search: SearchDto)
const result = await service.findAll(
  { page: 1, limit: 10 },
  { query: '', status: undefined }
);
```

### Rule 5: Use Prisma Enum Values from Schema

**WRONG** - Guessing enum values:
```typescript
status: OrderStatus.PENDING     // Does not exist
status: CustomerTier.PREMIUM    // Does not exist
status: PaymentStatus.COMPLETED // Does not exist
```

**RIGHT** - Read prisma/schema.prisma first:
```typescript
// From schema: enum OrderStatus { DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, ... }
status: OrderStatus.DRAFT

// From schema: enum CustomerTier { STANDARD, SILVER, GOLD, PLATINUM }
tier: CustomerTier.GOLD

// From schema: enum PaymentStatus { PENDING, AUTHORIZED, CAPTURED, FAILED, ... }
status: PaymentStatus.CAPTURED
```

### Rule 6: Add Definite Assignment to DTOs

All DTO class properties with decorators need `!` for strict TypeScript:

**WRONG**:
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;  // TS2564: Property has no initializer
}
```

**RIGHT**:
```typescript
export class RegisterDto {
  @IsEmail()
  email!: string;  // Definite assignment assertion
}
```

### Rule 7: Method Name Conventions

Follow NestJS conventions - don't guess:

| Operation | NestJS Convention | Common Wrong Guesses |
|-----------|-------------------|----------------------|
| Delete | `remove(id)` | `delete(id)`, `destroy(id)` |
| List | `findAll(pagination, search)` | `getAll()`, `list()` |
| Find one | `findOne(id)` | `get(id)`, `getById(id)` |
| Update | `update(id, dto)` | `edit(id, dto)`, `modify(id, dto)` |

## Verification Checklist

Before generating any test file, verify:

- [ ] Read the target `.service.ts` or `.controller.ts` file
- [ ] Extract all public method names and signatures
- [ ] Read all DTO files used by the service
- [ ] Read `prisma/schema.prisma` for enum definitions
- [ ] Confirm method parameter counts match
- [ ] Confirm DTO field names match exactly
- [ ] Confirm enum values exist in schema

## Test File Generation Workflow

### Step 1: Gather Implementation Facts

```bash
# 1. Get service methods
grep -E "^\s+async\s+\w+\(" src/modules/{module}/{module}.service.ts

# 2. Get DTO structure
cat src/modules/{module}/dto/create-{module}.dto.ts

# 3. Get relevant enums
grep -A 10 "enum {EnumName}" prisma/schema.prisma
```

### Step 2: Build Test Skeleton from Facts

Only test methods that actually exist:

```typescript
describe('CustomersService', () => {
  // Based on actual service methods found:
  describe('create', () => { /* ... */ });
  describe('findAll', () => { /* ... */ });
  describe('findOne', () => { /* ... */ });
  describe('update', () => { /* ... */ });
  describe('remove', () => { /* ... */ });  // NOT delete()
});
```

### Step 3: Use Correct Mock Data

```typescript
// Based on actual CreateCustomerDto fields:
const createDto: CreateCustomerDto = {
  firstName: 'John',       // from DTO
  lastName: 'Doe',         // from DTO
  email: 'john@test.com',  // from DTO
  tier: CustomerTier.GOLD, // from Prisma schema
};
```

### Step 4: Match Method Signatures

```typescript
// Based on actual service signature:
// findAll(pagination: PaginationDto, search: CustomerSearchDto)
const result = await service.findAll(
  { page: 1, limit: 10 },
  { query: '', tier: undefined }
);
```

## Common Anti-Patterns to Avoid

### Anti-Pattern 1: Template-Based Generation

**DON'T** use generic test templates that assume standard CRUD:
```typescript
// Generic template assumes:
service.validateUser()  // Not all auth services have this
service.delete()        // NestJS convention is remove()
service.getAll()        // NestJS convention is findAll()
```

### Anti-Pattern 2: Simplified Field Assumptions

**DON'T** assume simple field structures:
```typescript
// Template assumes:
{ name: 'John Doe' }

// Reality often is:
{ firstName: 'John', lastName: 'Doe' }
```

### Anti-Pattern 3: Generic Enum Values

**DON'T** assume common enum values exist:
```typescript
// Often assumed but don't exist:
Status.ACTIVE, Status.INACTIVE
Tier.PREMIUM, Tier.BASIC
PaymentStatus.COMPLETED, PaymentStatus.PENDING
```

### Anti-Pattern 4: Zero-Argument Assumptions

**DON'T** assume methods have no required parameters:
```typescript
// Template assumes:
findAll()

// Reality often is:
findAll(pagination, search)
findAll(options)
```

## Integration with Other Skills

| Skill | Coordination |
|-------|--------------|
| `nestjs-crud-resource` | After generating service, use this skill to generate aligned tests |
| `prisma-persistence` | Read generated schema for enum values before test generation |
| `dsl-model-interpreter` | Use parsed models to understand field structures |

## Validation

After generating tests, run:

```bash
pnpm run build  # or npm run build
```

If TS errors occur, categorize and fix:

| Error Code | Likely Cause | Fix |
|------------|--------------|-----|
| TS2339 | Method doesn't exist | Read service file, use correct method name |
| TS2345 | Wrong DTO fields | Read DTO file, use correct field names |
| TS2554 | Wrong arg count | Read method signature, add missing params |
| TS2564 | DTO property init | Add `!` to DTO property declarations |

## Non-Goals

- This skill does not generate test logic or assertions
- This skill does not determine what to test
- This skill only ensures structural alignment between tests and implementations
