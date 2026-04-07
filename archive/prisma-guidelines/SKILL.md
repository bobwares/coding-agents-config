---
name: prisma-guidelines
description: Prisma ORM development guidelines and constraints. Reference when working with Prisma schema, seed files, or configuration to avoid common mistakes.
---

# Prisma Development Guidelines

Guidelines and constraints for working with Prisma ORM in NestJS/Node.js projects.

## Purpose

Prevent common Prisma mistakes by documenting:
- Valid Prisma configuration patterns
- Schema-to-code synchronization requirements
- Seed file best practices
- Non-existent features to avoid

## Use When

- Creating or modifying Prisma schema
- Writing database seed files
- Configuring Prisma in a project
- Generating Prisma client

## Critical Constraints

### DO NOT Create These Files

| File | Reason |
|------|--------|
| `prisma.config.ts` | Does not exist in Prisma - there is no `prisma/config` module |
| `prisma.config.js` | Same - Prisma has no JavaScript config file format |

**Prisma configuration is done via:**
1. `schema.prisma` - Schema definition
2. `package.json` `prisma` field - Seed command configuration
3. Environment variables - Database URL, etc.

### Non-Existent Prisma APIs

Never use these - they do not exist:

```typescript
// WRONG - Does not exist
import { defineConfig } from 'prisma/config';

// WRONG - Does not exist
import { PrismaConfig } from '@prisma/client/config';

// WRONG - Does not exist
const config = prisma.config({...});
```

### Valid Prisma Package.json Configuration

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

This is the ONLY valid Prisma configuration in package.json.

## Schema-Seed Synchronization

### Rule: Seed Files Must Match Schema Exactly

Before writing seed data, **always read the current schema.prisma** to verify:

1. **Field names** - Use exact field names from schema
2. **Required fields** - Include all non-optional fields
3. **Enum values** - Import and use schema enums
4. **Relation fields** - Use correct relation syntax
5. **Unique constraints** - Use correct compound key names

### Common Seed File Mistakes

| Mistake | Correct Approach |
|---------|------------------|
| Using field that doesn't exist | Read schema first, use only defined fields |
| Wrong compound unique key name | Check `@@unique([fields])` - key is `field1_field2` |
| Missing required enum `type` field | Check if model has required enum fields |
| Using `address` when schema has `street` | Match exact field names from schema |

### Compound Unique Key Naming

For `@@unique([sku, locationId])`, the key name is:
- `sku_locationId` (fields joined with underscore)

```typescript
// CORRECT
await prisma.inventoryItem.upsert({
  where: {
    sku_locationId: {
      sku: product.sku,
      locationId: warehouse.id,
    },
  },
  ...
});

// WRONG - field names don't match constraint
where: {
  productId_locationId: { ... }  // Schema has sku_locationId
}
```

## Seed File Template

```typescript
import { PrismaClient } from '@prisma/client';
// Import ALL enums you'll use from @prisma/client
import {
  CustomerStatus,
  CustomerTier,
  AddressType,
  // ... other enums
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Always use schema-defined enum values
  const customer = await prisma.customer.create({
    data: {
      // Required fields from schema
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      // Enum fields - use imported enum
      status: CustomerStatus.ACTIVE,
      tier: CustomerTier.STANDARD,
      // Nested relations
      addresses: {
        create: {
          type: AddressType.BOTH,  // Required enum field
          street: '123 Main St',   // Use exact field name from schema
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
        },
      },
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Pre-Seed Checklist

Before running `npm run db:seed`:

- [ ] Read `schema.prisma` to verify current model structure
- [ ] Verify all field names in seed match schema exactly
- [ ] Import all required enums from `@prisma/client`
- [ ] Check unique constraint field names for upsert operations
- [ ] Run `npx prisma generate` if schema changed

## Prisma Commands Reference

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Generate client from schema |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma db push` | Push schema to DB (dev only) |
| `npx prisma db seed` | Run seed file |
| `npx prisma studio` | Open database GUI |
| `npx prisma validate` | Validate schema syntax |

## Project Structure

```
apps/backend/
  prisma/
    schema.prisma     # Schema definition
    seed.ts           # Seed script
    migrations/       # Migration files
  package.json        # Contains prisma.seed config
```

## Validation Steps

After any Prisma changes:

```bash
# 1. Validate schema
npx prisma validate

# 2. Generate client (creates types)
npx prisma generate

# 3. Build to check TypeScript
npm run build

# 4. Run seed to verify data
npm run db:seed
```

## Non-Goals

- Database design decisions
- Migration strategies
- Multi-database setup
- Prisma Accelerate/Pulse configuration
