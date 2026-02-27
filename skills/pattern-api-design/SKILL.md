---
name: pattern-api-design
description: REST API design patterns for consistent endpoints, pagination, error responses, and versioning. Activate when designing or reviewing API endpoints.
---

# REST API Design Patterns

## URL Conventions

```
# Resources (plural nouns)
GET    /api/v1/users           # List users
POST   /api/v1/users           # Create user
GET    /api/v1/users/:id       # Get user
PATCH  /api/v1/users/:id       # Partial update
DELETE /api/v1/users/:id       # Delete user

# Nested resources
GET    /api/v1/users/:id/posts # User's posts
POST   /api/v1/users/:id/posts # Create user's post

# Actions (when not CRUD)
POST   /api/v1/users/:id/activate
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
```

## Standard Response Envelope

```typescript
// Success (list)
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "totalPages": 5, "limit": 20 }
}

// Success (single)
{
  "data": { "id": "...", "name": "..." }
}

// Error
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID abc123 was not found",
    "details": {} // Optional: field errors for validation
  }
}
```

## Cursor-Based Pagination

```typescript
// Request: GET /api/v1/users?cursor=<base64>&limit=20
// Response:
{
  "data": [...],
  "meta": {
    "nextCursor": "base64encodedcursor",
    "hasMore": true,
    "limit": 20
  }
}

// Implementation (Drizzle)
export async function getUsersCursor(cursor: string | null, limit: number) {
  const where = cursor
    ? lt(users.createdAt, new Date(Buffer.from(cursor, 'base64').toString()))
    : undefined;

  const items = await db.select().from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit + 1); // Fetch one extra to detect hasMore

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore
    ? Buffer.from(data[data.length - 1].createdAt.toISOString()).toString('base64')
    : null;

  return { data, meta: { nextCursor, hasMore, limit } };
}
```

## Error Codes

Use semantic string codes, not just HTTP status numbers:

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `VALIDATION_ERROR` | 400 | Input failed validation |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but no permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate resource |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Filtering and Sorting

```
GET /api/v1/users?role=admin&sort=createdAt:desc&q=alice
```

```typescript
const querySchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  sort: z.string().regex(/^[a-z]+:(asc|desc)$/).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
```

## Versioning

- URL path versioning: `/api/v1/`, `/api/v2/`
- Never remove or break existing versions
- Deprecate with `Deprecation` and `Sunset` response headers

## Anti-Patterns

- Verbs in URLs (`/getUsers`, `/createPost`)
- Inconsistent plural/singular
- Returning arrays at the root (always wrap in `{ data: [] }`)
- Offset pagination for large datasets (use cursor)
- HTTP 200 for errors with `{ success: false }` in body
