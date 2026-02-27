---
name: pattern-drizzle
description: Drizzle ORM patterns for PostgreSQL. Activate when designing schemas, writing queries, creating migrations, or handling database transactions.
---

# Drizzle ORM + PostgreSQL Patterns

## Schema Design

```typescript
// packages/database/schema/users.ts
import { pgTable, uuid, text, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'superadmin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('users_email_idx').on(t.email),
]);

// Always export inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Relations

```typescript
// packages/database/schema/relations.ts
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

## DB Instance

```typescript
// packages/database/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export type DB = typeof db;
```

## Query Patterns

```typescript
// Basic CRUD
const allUsers = await db.select().from(users).orderBy(asc(users.createdAt));

const user = await db.query.users.findFirst({
  where: eq(users.id, id),
  with: { posts: true }, // Include relations
});

const [created] = await db.insert(users).values({ name, email }).returning();

const [updated] = await db.update(users)
  .set({ name, updatedAt: new Date() })
  .where(eq(users.id, id))
  .returning();

await db.delete(users).where(eq(users.id, id));
```

## Pagination Pattern

```typescript
export async function getUsers(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db.select().from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt)),
    db.select({ count: count() }).from(users),
  ]);

  return {
    items,
    total: Number(countResult[0].count),
    page,
    totalPages: Math.ceil(Number(countResult[0].count) / limit),
  };
}
```

## Transactions

```typescript
// Always use transactions for multi-step mutations
const result = await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values(userData).returning();
  await tx.insert(userProfiles).values({ userId: user.id, ...profileData });
  await tx.insert(auditLog).values({ action: 'user.created', userId: user.id });
  return user;
});
```

## Migrations

```bash
# After schema changes:
pnpm db:generate   # Generates migration SQL
pnpm db:migrate    # Applies pending migrations
pnpm db:studio     # Open Drizzle Studio UI
```

## drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './packages/database/schema/**/*.ts',
  out: './packages/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

## Anti-Patterns

- Auto-increment integer IDs — use UUID `.defaultRandom()`
- Timestamps without `withTimezone: true`
- Multi-step mutations outside transactions
- Forgetting to export `$inferSelect` / `$inferInsert` types
- Defining indexes in migrations (define them in schema)
