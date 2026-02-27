---
name: pattern-spring
description: Spring WebFlux + R2DBC reactive patterns for non-blocking APIs, reactive repositories, WebClient, and StepVerifier testing. Activate when working in the services/enterprise directory.
triggers:
  - when working in services/enterprise directory
  - when building Spring Boot REST APIs
  - when implementing reactive endpoints with WebFlux
  - when using R2DBC for database access
  - when configuring WebClient for HTTP calls
---

# Spring WebFlux Reactive Patterns

All Spring Boot applications use **Project Reactor** for fully non-blocking reactive APIs.

## Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Reactive Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <!-- Reactive Data Access -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-r2dbc</artifactId>
    </dependency>

    <!-- PostgreSQL R2DBC Driver -->
    <dependency>
        <groupId>io.r2dbc</groupId>
        <artifactId>r2dbc-postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Reactive Testing -->
    <dependency>
        <groupId>io.projectreactor</groupId>
        <artifactId>reactor-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Layer Architecture

```
services/enterprise/src/main/java/com/example/
├── controller/         # WebFlux controllers (@RestController)
├── service/            # Reactive business logic (@Service)
├── repository/         # R2DBC repositories (ReactiveCrudRepository)
├── entity/             # R2DBC entities (@Table)
├── dto/                # Java Records for request/response
├── exception/          # Reactive exception handling
├── config/             # WebClient, R2DBC, Security config
└── client/             # WebClient wrappers for external APIs
```

## R2DBC Entity

```java
// entity/User.java
@Table("users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    private UUID id;

    @Column("name")
    private String name;

    @Column("email")
    private String email;

    @Column("role")
    private UserRole role = UserRole.USER;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    // R2DBC callback for auto-generating ID and timestamps
    @PersistenceCreating
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }
}
```

## DTO as Java Record

```java
// dto/CreateUserRequest.java
public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    UserRole role
) {
    public CreateUserRequest {
        if (role == null) role = UserRole.USER;
    }
}

// dto/UserResponse.java
public record UserResponse(UUID id, String name, String email, UserRole role, Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
            user.getRole(), user.getCreatedAt());
    }
}
```

## Reactive Repository

```java
// repository/UserRepository.java
@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {

    Mono<User> findByEmail(String email);

    Mono<Boolean> existsByEmail(String email);

    Flux<User> findByRole(UserRole role);

    @Query("SELECT * FROM users WHERE name ILIKE :pattern")
    Flux<User> searchByName(String pattern);
}
```

## Reactive Service

```java
// service/UserService.java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;

    public Mono<UserResponse> createUser(CreateUserRequest request) {
        return userRepository.existsByEmail(request.email())
            .flatMap(exists -> {
                if (exists) {
                    return Mono.error(new ConflictException("Email already exists: " + request.email()));
                }
                User user = new User();
                user.setName(request.name());
                user.setEmail(request.email());
                user.setRole(request.role());
                return userRepository.save(user);
            })
            .map(UserResponse::from)
            .doOnSuccess(u -> log.info("Created user: {}", u.id()));
    }

    public Mono<UserResponse> findById(UUID id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found: " + id)));
    }

    public Flux<UserResponse> findAll() {
        return userRepository.findAll()
            .map(UserResponse::from);
    }

    @Transactional
    public Mono<Void> deleteById(UUID id) {
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found: " + id)))
            .flatMap(user -> userRepository.delete(user))
            .doOnSuccess(v -> log.info("Deleted user: {}", id));
    }
}
```

## WebFlux Controller

```java
// controller/UserController.java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management")
public class UserController {
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create user")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "409", description = "Email conflict")
    public Mono<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "Not found")
    public Mono<UserResponse> findById(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @GetMapping
    @Operation(summary = "List all users")
    public Flux<UserResponse> findAll() {
        return userService.findAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete user")
    public Mono<Void> delete(@PathVariable UUID id) {
        return userService.deleteById(id);
    }
}
```

## Reactive Exception Handler

```java
// exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return Mono.just(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Mono<ErrorResponse> handleConflict(ConflictException ex) {
        return Mono.just(new ErrorResponse("CONFLICT", ex.getMessage()));
    }

    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Mono<ErrorResponse> handleValidation(WebExchangeBindException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return Mono.just(new ErrorResponse("VALIDATION_ERROR", message));
    }
}
```

## WebClient Configuration

```java
// config/WebClientConfig.java
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
            .baseUrl("https://api.external-service.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .filter(logRequest())
            .build();
    }

    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            log.debug("Request: {} {}", request.method(), request.url());
            return Mono.just(request);
        });
    }
}
```

## WebClient Usage

```java
// client/ExternalApiClient.java
@Component
@RequiredArgsConstructor
@Slf4j
public class ExternalApiClient {
    private final WebClient webClient;

    public Mono<ExternalData> fetchData(String resourceId) {
        return webClient.get()
            .uri("/resources/{id}", resourceId)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response ->
                Mono.error(new ResourceNotFoundException("Resource not found: " + resourceId)))
            .onStatus(HttpStatusCode::is5xxServerError, response ->
                Mono.error(new ExternalServiceException("External service error")))
            .bodyToMono(ExternalData.class)
            .timeout(Duration.ofSeconds(10))
            .doOnError(e -> log.error("Failed to fetch resource {}: {}", resourceId, e.getMessage()));
    }

    public Flux<ExternalData> fetchAllData() {
        return webClient.get()
            .uri("/resources")
            .retrieve()
            .bodyToFlux(ExternalData.class);
    }
}
```

## R2DBC Configuration

```java
// config/R2dbcConfig.java
@Configuration
@EnableR2dbcRepositories
public class R2dbcConfig extends AbstractR2dbcConfiguration {

    @Bean
    @Override
    public ConnectionFactory connectionFactory() {
        return ConnectionFactories.get(ConnectionFactoryOptions.builder()
            .option(DRIVER, "postgresql")
            .option(HOST, "localhost")
            .option(PORT, 5432)
            .option(USER, "postgres")
            .option(PASSWORD, "password")
            .option(DATABASE, "mydb")
            .build());
    }

    // Enable reactive transactions
    @Bean
    public ReactiveTransactionManager transactionManager(ConnectionFactory connectionFactory) {
        return new R2dbcTransactionManager(connectionFactory);
    }
}
```

## Reactive Testing with StepVerifier

```java
// service/UserServiceTest.java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_success() {
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com", UserRole.USER);
        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setName("John");
        savedUser.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(Mono.just(false));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(savedUser));

        StepVerifier.create(userService.createUser(request))
            .assertNext(response -> {
                assertThat(response.name()).isEqualTo("John");
                assertThat(response.email()).isEqualTo("john@example.com");
            })
            .verifyComplete();
    }

    @Test
    void createUser_emailConflict() {
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com", UserRole.USER);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(Mono.just(true));

        StepVerifier.create(userService.createUser(request))
            .expectError(ConflictException.class)
            .verify();
    }

    @Test
    void findById_notFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Mono.empty());

        StepVerifier.create(userService.findById(id))
            .expectError(ResourceNotFoundException.class)
            .verify();
    }
}
```

## WebFlux Controller Testing

```java
// controller/UserControllerTest.java
@WebFluxTest(UserController.class)
class UserControllerTest {
    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private UserService userService;

    @Test
    void createUser_returns201() {
        CreateUserRequest request = new CreateUserRequest("John", "john@example.com", UserRole.USER);
        UserResponse response = new UserResponse(UUID.randomUUID(), "John", "john@example.com",
            UserRole.USER, Instant.now());

        when(userService.createUser(any())).thenReturn(Mono.just(response));

        webTestClient.post()
            .uri("/api/v1/users")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(UserResponse.class)
            .value(r -> assertThat(r.name()).isEqualTo("John"));
    }

    @Test
    void findById_returns404() {
        UUID id = UUID.randomUUID();
        when(userService.findById(id)).thenReturn(
            Mono.error(new ResourceNotFoundException("User not found")));

        webTestClient.get()
            .uri("/api/v1/users/{id}", id)
            .exchange()
            .expectStatus().isNotFound();
    }
}
```

## Anti-Patterns

| Anti-Pattern | Why Bad | Correct Approach |
|--------------|---------|------------------|
| `.block()` in production | Blocks the event loop, defeats purpose of reactive | Use reactive operators, compose with `flatMap`/`map` |
| Mixing JPA + R2DBC | Different threading models, connection pool conflicts | Choose one: R2DBC for reactive apps |
| `RestTemplate` | Blocking HTTP client | Use `WebClient` |
| `@Transactional` without reactive manager | Won't work correctly | Use `R2dbcTransactionManager` |
| Returning `ResponseEntity<T>` with blocking body | Unnecessary wrapper | Return `Mono<T>` / `Flux<T>` directly |
| Thread.sleep() in tests | Flaky, slow | Use `StepVerifier` with virtual time |
| Missing error handling | Unhandled errors crash streams | Use `onErrorResume`, `onErrorMap` |
