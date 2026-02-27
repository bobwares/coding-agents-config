---
name: pattern-react-ui
description: React UI patterns for loading states, error handling, empty states, and custom hooks. Activate when building React components with async data or complex state.
---

# React UI Patterns

## The Four States Rule

Every component that fetches data must handle all four states:

```typescript
// The correct order: Error -> Loading (no data) -> Empty -> Success
function UserList() {
  const { data, isLoading, error } = useUsers();

  if (error) return <ErrorMessage error={error} />;
  if (isLoading && !data) return <UserListSkeleton />;  // KEY: && !data
  if (!data || data.length === 0) return <EmptyState message="No users found" />;

  return (
    <div>
      {data.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

## Loading State Anti-Pattern

```typescript
// WRONG — clears existing data during refresh
if (isLoading) return <Spinner />;

// CORRECT — shows spinner only when there's no data yet
if (isLoading && !data) return <Skeleton />;
// This means: during refresh, keep showing old data with a subtle indicator
```

## Skeleton Loading

```typescript
// components/skeletons/UserCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function UserCardSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => <UserCardSkeleton key={i} />)}
    </div>
  );
}
```

## Empty State Component

```typescript
// components/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ icon, message, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="text-lg font-medium">{message}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button className="mt-4" onClick={action.onClick} asChild={!!action.href}>
          {action.href ? <a href={action.href}>{action.label}</a> : action.label}
        </Button>
      )}
    </div>
  );
}
```

## Custom Hook Pattern

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      fetch('/api/users', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
```

## Button with Loading

```typescript
export function SubmitButton({ children, isLoading, ...props }: ButtonProps & { isLoading?: boolean }) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

## Anti-Patterns

- `if (isLoading) return <Spinner />` — clears existing data
- `useEffect` for data fetching (use server components or React Query)
- Missing empty states (lists that silently show nothing)
- Enabled buttons during pending async operations
- Not handling error states
