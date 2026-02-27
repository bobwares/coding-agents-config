---
name: pattern-testing
description: Testing patterns for Vitest (unit/integration), JUnit 5 + Mockito (Java), and Playwright (E2E). Includes factory functions, mocking patterns, and TDD workflow. Activate when writing or fixing tests.
triggers:
  - writing tests
  - fixing tests
  - test failures
  - TDD
  - unit test
  - integration test
---

# Testing Patterns

---

## TypeScript Testing (Vitest)

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80 },
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.config.*'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

## Factory Pattern

```typescript
// tests/factories/user.factory.ts
import { User } from '@/packages/database/schema';

let counter = 0;

export function getMockUser(overrides?: Partial<User>): User {
  counter++;
  return {
    id: `user-${counter}-${Date.now()}`,
    name: `Test User ${counter}`,
    email: `user-${counter}@test.com`,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

## Service Unit Test

```typescript
// users.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    service = new UsersService(mockDb);
  });

  describe('create', () => {
    it('creates and returns a user', async () => {
      const dto = { name: 'Alice', email: 'alice@test.com' };
      const expected = getMockUser(dto);
      mockDb.insert.mockResolvedValue([expected]);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockDb.insert).toHaveBeenCalledWith(users);
    });

    it('throws ConflictException on duplicate email', async () => {
      const dto = { name: 'Alice', email: 'alice@test.com' };
      mockDb.insert.mockRejectedValue(new Error('unique constraint'));

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
```

## Playwright E2E Test

```typescript
// e2e/users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('creates a user via the form', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByLabel('Name').fill('Alice');
    await page.getByLabel('Email').fill('alice@test.com');
    await page.getByRole('button', { name: 'Create User' }).click();

    await expect(page).toHaveURL('/users');
    await expect(page.getByText('Alice')).toBeVisible();
  });

  test('shows empty state when no users exist', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('No users yet')).toBeVisible();
  });
});
```

## TDD Workflow

```
1. Write a failing test that describes the behavior
2. Run: pnpm test --run <test-file>
3. Confirm it fails with the expected reason
4. Implement the minimum code to make it pass
5. Run tests again — confirm green
6. Refactor if needed, keeping tests green
```

## Coverage Commands

```bash
pnpm test --run                    # Run all tests once
pnpm test --watch                  # Watch mode
pnpm test --coverage               # With coverage report
pnpm test --run users.service.spec # Specific file
pnpm test --run --reporter=verbose # Verbose output
```

## TypeScript Anti-Patterns

- Testing implementation details (private methods, internal state)
- Deleting tests to fix coverage
- Snapshot tests for rapidly changing UI
- Shared mutable state between tests (always `beforeEach` reset)
- Tests that call real external services (mock everything external)

---

## Java Testing (JUnit 5 + Mockito)

## Maven Test Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<!-- Includes: JUnit 5, Mockito, AssertJ, Hamcrest, Spring Test -->
```

## Unit Test Pattern (Services)

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUser = User.builder()
            .id(sampleUserId)
            .name("Alice")
            .email("alice@test.com")
            .createdAt(OffsetDateTime.now())
            .build();
    }

    @Nested
    @DisplayName("getUser")
    class GetUser {

        @Test
        @DisplayName("should return user when found")
        void shouldReturnUserWhenFound() {
            // Given
            when(userRepository.findById(sampleUserId))
                .thenReturn(Optional.of(sampleUser));

            // When
            UserDto result = userService.getUser(sampleUserId);

            // Then
            assertThat(result.getId()).isEqualTo(sampleUserId);
            assertThat(result.getName()).isEqualTo("Alice");
            verify(userRepository).findById(sampleUserId);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when not found")
        void shouldThrowExceptionWhenNotFound() {
            // Given
            UUID unknownId = UUID.randomUUID();
            when(userRepository.findById(unknownId))
                .thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> userService.getUser(unknownId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("not found");
        }
    }

    // Factory method in test class
    private User getMockUser(String name, String email) {
        return User.builder()
            .id(UUID.randomUUID())
            .name(name)
            .email(email)
            .build();
    }
}
```

## Integration Test Pattern (Controllers)

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Nested
    @DisplayName("GET /api/users/{id}")
    class GetUser {

        @Test
        @DisplayName("should return user when found")
        void shouldReturnUserWhenFound() throws Exception {
            // Given
            UUID userId = UUID.randomUUID();
            UserDto user = UserDto.builder()
                .id(userId)
                .name("Alice")
                .build();
            when(userService.getUser(userId)).thenReturn(user);

            // When/Then
            mockMvc.perform(get("/api/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(userId.toString())))
                .andExpect(jsonPath("$.name", is("Alice")));
        }

        @Test
        @DisplayName("should return 404 when user not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // Given
            UUID unknownId = UUID.randomUUID();
            when(userService.getUser(unknownId))
                .thenThrow(new EntityNotFoundException("User not found"));

            // When/Then
            mockMvc.perform(get("/api/users/{id}", unknownId))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/users")
    class CreateUser {

        @Test
        @DisplayName("should create user and return 201")
        void shouldCreateUserAndReturn201() throws Exception {
            // Given
            UserDto created = UserDto.builder()
                .id(UUID.randomUUID())
                .name("Alice")
                .build();
            when(userService.createUser(anyString(), anyString()))
                .thenReturn(created);

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Alice\",\"email\":\"alice@test.com\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Alice")));
        }
    }
}
```

## Reactive Test Pattern (StepVerifier)

```java
@ExtendWith(MockitoExtension.class)
class ReactiveUserServiceTest {

    @Mock
    private ReactiveUserRepository userRepository;

    @InjectMocks
    private ReactiveUserService userService;

    @Test
    @DisplayName("should return user reactively")
    void shouldReturnUserReactively() {
        // Given
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("Alice").build();
        when(userRepository.findById(userId)).thenReturn(Mono.just(user));

        // When/Then
        StepVerifier.create(userService.getUser(userId))
            .assertNext(result -> {
                assertThat(result.getId()).isEqualTo(userId);
                assertThat(result.getName()).isEqualTo("Alice");
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("should return error when not found")
    void shouldReturnErrorWhenNotFound() {
        // Given
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Mono.empty());

        // When/Then
        StepVerifier.create(userService.getUser(unknownId))
            .expectError(EntityNotFoundException.class)
            .verify();
    }

    @Test
    @DisplayName("should return all users as flux")
    void shouldReturnAllUsersAsFlux() {
        // Given
        User user1 = User.builder().name("Alice").build();
        User user2 = User.builder().name("Bob").build();
        when(userRepository.findAll()).thenReturn(Flux.just(user1, user2));

        // When/Then
        StepVerifier.create(userService.getAllUsers())
            .expectNextCount(2)
            .verifyComplete();
    }
}
```

## Java Test Commands

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run specific test method
mvn test -Dtest=UserServiceTest#shouldReturnUserWhenFound

# Run tests matching pattern
mvn test -Dtest="*ServiceTest"

# Run tests in specific module
mvn test -pl api

# Run with coverage (requires JaCoCo plugin)
mvn test jacoco:report

# Run integration tests
mvn verify
```

## Java Anti-Patterns

- `Thread.sleep()` in tests — use `StepVerifier` or `Awaitility`
- Missing `@BeforeEach` cleanup — always reset mocks
- Testing private methods — test through public API
- Hardcoded UUIDs — use `UUID.randomUUID()`
- Missing `@DisplayName` — tests should be readable
- `@SpringBootTest` for unit tests — use `@WebMvcTest` or `@ExtendWith(MockitoExtension.class)`
- `.block()` in reactive tests — use `StepVerifier`

## Test File Locations

| Type | Location |
|------|----------|
| TypeScript unit | Co-located: `*.test.ts` or `*.spec.ts` |
| TypeScript E2E | `e2e/` directory |
| Java unit | `src/test/java/...` mirroring `src/main/java/...` |
| Java integration | Same as unit tests, use `@WebMvcTest` |
| HTTP E2E | `e2e/*.http` files |
