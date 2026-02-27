---
name: pattern-nextjs
description: Next.js 15 App Router patterns. Activate when building pages, layouts, server components, server actions, route handlers, or dealing with caching and metadata.
---

# Next.js 15 App Router Patterns

## Core Principles

1. **Server Components by default** — Only use `'use client'` when you need: event handlers, browser APIs, useState, or useEffect
2. **Data fetching in Server Components** — Never use useEffect or useQuery for initial data; fetch directly in the async component
3. **Async params** — In Next.js 15, `params` and `searchParams` are Promises; always `await` them
4. **Server Actions for mutations** — Use `'use server'` functions; validate with Zod; call `revalidatePath`

## File Conventions

| File | Purpose | Notes |
|------|---------|-------|
| `page.tsx` | Route page | Async, receives `{ params, searchParams }` |
| `layout.tsx` | Persistent wrapper | Wraps child pages |
| `loading.tsx` | Suspense fallback | Auto-wraps page in Suspense |
| `error.tsx` | Error boundary | Must be `'use client'` |
| `not-found.tsx` | 404 page | Call `notFound()` from anywhere |
| `route.ts` | API endpoint | Replaces pages/api |
| `actions.ts` | Server Actions | `'use server'` at top |

## Server Component: Data Fetching

```typescript
// app/users/page.tsx
import { db } from '@/lib/db';
import { users } from '@/packages/database/schema';

export default async function UsersPage() {
  // Direct async call — no useState, no useEffect, no loading
  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  if (allUsers.length === 0) {
    return <EmptyState message="No users yet." action={{ label: 'Create user', href: '/users/new' }} />;
  }

  return (
    <div>
      <UserList users={allUsers} />
    </div>
  );
}
```

## Next.js 15: Async Params (Breaking Change)

```typescript
// Correct for Next.js 15
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Must await
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) notFound();
  return <UserDetail user={user} />;
}

// Wrong — breaks in Next.js 15
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await db.query.users.findFirst({ where: eq(users.id, params.id) });
  // ...
}
```

## Server Actions

```typescript
// app/users/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { users } from '@/packages/database/schema';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function createUser(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = createUserSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  try {
    const [user] = await db.insert(users).values(result.data).returning();
    revalidatePath('/users');
    return { success: true, user };
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      return { error: { email: ['Email already exists'] } };
    }
    throw err;
  }
}

// app/users/new/page.tsx (Client form)
'use client';
import { useActionState } from 'react';
import { createUser } from '../actions';

export default function NewUserPage() {
  const [state, action, isPending] = useActionState(createUser, null);
  return (
    <form action={action}>
      <input name="name" required />
      <input name="email" type="email" required />
      {state?.error?.email && <p className="text-red-500">{state.error.email[0]}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## Loading States — The Golden Rule

```typescript
// Correct: Show loading ONLY when there is no data yet
if (isLoading && !data) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataDisplay data={data} />;

// Wrong: Showing loading spinner over existing data
if (isLoading) return <Spinner />; // Wipes out existing data from view
```

## Route Handler (API)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = querySchema.parse(Object.fromEntries(searchParams));

  const data = await db.query.users.findMany({
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
    orderBy: [desc(users.createdAt)],
  });

  return NextResponse.json({ data, page: query.page });
}
```

## Metadata

```typescript
// app/users/[id]/page.tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  return {
    title: user ? `${user.name} — MyApp` : 'User Not Found',
  };
}
```

## Anti-Patterns to Avoid

- `useEffect` for data fetching in components — use Server Components
- `getServerSideProps` — App Router doesn't use it
- Non-awaited `params` in Next.js 15
- Exposing database connection in client components
- `if (isLoading) return <Spinner />` over existing data
