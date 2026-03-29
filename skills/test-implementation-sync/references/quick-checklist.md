# Test-Implementation Sync Quick Checklist

## Before Writing ANY Test File

```
[ ] 1. Read target service/controller file
[ ] 2. List all public methods with signatures
[ ] 3. Read all DTO files the service imports
[ ] 4. Read prisma/schema.prisma for enums
[ ] 5. Note method parameter counts
[ ] 6. Note DTO field names (firstName vs name)
[ ] 7. Note enum values (GOLD vs PREMIUM)
```

## Method Name Reality Check

| If template uses | NestJS actually uses |
|------------------|---------------------|
| `delete(id)` | `remove(id)` |
| `getAll()` | `findAll(...)` |
| `get(id)` | `findOne(id)` |
| `edit(id, dto)` | `update(id, dto)` |
| `validateUser()` | Check actual service |

## DTO Field Reality Check

| If template uses | Check actual DTO for |
|------------------|---------------------|
| `name` | `firstName` + `lastName` |
| `address` | `street` + `city` + `state` + `postalCode` |
| `phone` | `phoneNumber` or `mobile` |

## Enum Value Reality Check

Always grep the Prisma schema:
```bash
grep -A 10 "enum CustomerTier" prisma/schema.prisma
grep -A 10 "enum OrderStatus" prisma/schema.prisma
grep -A 10 "enum PaymentStatus" prisma/schema.prisma
```

## DTO Class Properties

All decorated properties need `!`:
```typescript
@IsString()
firstName!: string;  // <-- ! is required
```

## Validation Command

```bash
pnpm run build
# Zero errors = tests are synchronized
```
