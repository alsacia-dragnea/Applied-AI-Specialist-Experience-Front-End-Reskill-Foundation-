# Chapter & Co. — Spring Boot Backend

Cloud FullStack Capstone — Java 21 Spring Boot backend for the Chapter & Co. eCommerce bookstore.

This module is a **self-contained Spring Boot backend** that reuses the same PostgreSQL database as the Next.js frontend from the Front-End Capstone. Both backends can run simultaneously: Next.js on port 3000, Spring Boot on port 8080.

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.3.5 |
| Web | Spring Web (REST) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL 17 (shared with Next.js) |
| Security | Spring Security + JWT (jjwt 0.12.6) |
| Validation | Jakarta Bean Validation |
| API Docs | SpringDoc OpenAPI / Swagger UI |
| Build | Maven 3.9+ |
| Tests | JUnit 5 + Mockito + Spring Boot Test |

---

## Prerequisites

- Java 21 (`brew install openjdk@21`)
- Maven 3.9+
- PostgreSQL running (Docker or local)
- Existing `chapter_and_co` database from the Front-End capstone (seeded with 30 books)

---

## Quick start

```bash
cd backend

# Set JAVA_HOME to Java 21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21

# Build (skip tests)
mvn clean package -DskipTests

# Run (connects to shared PostgreSQL on port 5432)
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.
Swagger UI: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/api-docs`

---

## Configuration

All configuration is in [`src/main/resources/application.properties`](src/main/resources/application.properties).

Every value can be overridden through an environment variable (see [`docs/DEVOPS.md`](../docs/DEVOPS.md)).

| Property | Env var | Default | Description |
|----------|---------|---------|-------------|
| `spring.datasource.url` | `DB_URL` | `jdbc:postgresql://localhost:5432/chapter_and_co` | Shared DB |
| `spring.datasource.username` | `DB_USERNAME` | `admin` | PostgreSQL username |
| `spring.datasource.password` | `DB_PASSWORD` | `admin` | PostgreSQL password |
| `app.jwt.secret` | `JWT_SECRET` | (dev placeholder) | **Must be set in production** |
| `app.jwt.expiration-ms` | `JWT_EXPIRATION_MS` | `86400000` | 24 hours |
| `app.cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated origins |
| `server.port` | `SERVER_PORT` | `8080` | Spring Boot port |

Health probes: `/actuator/health/liveness` and `/actuator/health/readiness`.

## Containers, CI/CD and cloud deployment

See [`docs/DEVOPS.md`](../docs/DEVOPS.md): Dockerfile and docker-compose, GitHub Actions (CI, CodeQL, Trivy, Gitleaks, ZAP), Kustomize/ArgoCD GitOps manifests, Terraform IaC, and the log triage script.

---

## REST API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user, returns JWT |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/books` | — | List books (search, category, author, sort, page) |
| GET | `/api/v1/books/featured` | — | Featured books |
| GET | `/api/v1/books/bestsellers` | — | Bestselling books |
| GET | `/api/v1/books/{slug}` | — | Book detail by slug + estimated delivery window (3–5 days) |
| GET | `/api/v1/books/{slug}/related` | — | Related books (same primary category, max 4) |
| GET | `/api/v1/authors` | — | All authors (browse by brand) |
| GET | `/api/v1/categories` | — | All categories |
| GET | `/api/v1/categories/{slug}` | — | Category by slug |
| GET | `/api/v1/recommendations` | Optional | Personalized recommendations |
| GET | `/api/v1/addresses` | ✓ Bearer | List user addresses |
| POST | `/api/v1/addresses` | ✓ Bearer | Create address |
| POST | `/api/v1/checkout` | ✓ Bearer | Place order (server-side pricing) |
| GET | `/api/v1/orders` | ✓ Bearer | Order history |
| GET | `/api/v1/orders/buy-again` | ✓ Bearer | Distinct books from past (non-cancelled) orders, for "Buy again" |
| GET | `/api/v1/orders/{id}` | ✓ Bearer | Order detail |
| PATCH | `/api/v1/orders/{id}` | ✓ Bearer | Cancel order (48-hr rule) |
| GET | `/api/v1/gift-points` | ✓ Bearer | Gift points balance |

Authentication uses `Authorization: Bearer <JWT>` header.

---

## Running tests

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21

# All tests (uses H2 in-memory DB)
mvn test \
  -Dspring.datasource.url=jdbc:h2:mem:testdb \
  -Dspring.datasource.driver-class-name=org.h2.Driver \
  -Dspring.datasource.username=sa \
  -Dspring.datasource.password= \
  -Dspring.jpa.hibernate.ddl-auto=create-drop \
  -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect \
  -Dapp.jwt.secret=test-secret-key-for-unit-tests-only-256bits-padding00 \
  -Dapp.jwt.expiration-ms=3600000
```

### Test results (50 / 50 passing)

| Suite | Tests | Type |
|-------|-------|------|
| `AuthServiceTest` | 5 | Unit (Mockito) |
| `OrderServiceTest` | 11 | Unit (Mockito) |
| `JwtTokenProviderTest` | 6 | Unit |
| `UserRepositoryTest` | 5 | DB persistence (`@DataJpaTest`) |
| `AuthControllerTest` | 6 | API (`@WebMvcTest` + MockMvc) |
| `BookControllerTest` | 6 | API (`@WebMvcTest` + MockMvc) |
| `ChapterAndCoApplicationTests` | 1 | Spring context load |
| `CheckoutIntegrationTest` | 6 | Real persistence (H2, real entities): checkout, cancel, buy-again, related, author filter |
| `OpenApiContractTest` | 2 | `docs/openapi.yaml` must match the operations the application serves |
| **Total** | **50** | **All passing** |

---

## Module structure

```
backend/
├── pom.xml
├── src/main/java/com/chapterandco/
│   ├── ChapterAndCoApplication.java
│   ├── config/
│   │   ├── OpenApiConfig.java          SpringDoc config + JWT security scheme
│   │   └── SecurityConfig.java         CSRF-off, CORS, JWT filter, public/protected routes
│   ├── controller/
│   │   ├── AuthController.java         POST /api/v1/auth/register|login
│   │   ├── BookController.java         GET  /api/v1/books/**
│   │   ├── CategoryController.java     GET  /api/v1/categories/**
│   │   ├── AddressController.java      GET|POST /api/v1/addresses
│   │   └── OrderController.java        POST /api/v1/checkout + orders + gift-points + recommendations
│   ├── dto/
│   │   ├── RegisterRequest.java        @NotBlank, @Email, @Size
│   │   ├── LoginRequest.java
│   │   ├── AuthResponse.java
│   │   ├── CheckoutRequest.java        Nested CheckoutItem record
│   │   └── AddressRequest.java
│   ├── entity/                         JPA entities mapped to existing Prisma tables
│   │   ├── User.java                   → users
│   │   ├── Author.java                 → authors
│   │   ├── Book.java                   → books (ManyToMany categories)
│   │   ├── Category.java               → categories
│   │   ├── Address.java                → addresses
│   │   ├── Order.java                  → orders
│   │   ├── OrderItem.java              → order_items
│   │   ├── Payment.java                → payments
│   │   ├── GiftPointsTransaction.java  → gift_points_transactions
│   │   └── enums: OrderStatus, PaymentMethod, PaymentStatus, GiftPointsType
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   ├── BusinessRuleException.java
│   │   └── GlobalExceptionHandler.java  @RestControllerAdvice
│   ├── repository/
│   │   ├── BookRepository.java          Custom @Query with filters
│   │   ├── CategoryRepository.java
│   │   ├── UserRepository.java
│   │   ├── AddressRepository.java
│   │   ├── OrderRepository.java
│   │   └── GiftPointsTransactionRepository.java
│   ├── security/
│   │   ├── JwtTokenProvider.java        Generate / validate / parse JWT
│   │   └── JwtAuthenticationFilter.java OncePerRequestFilter — sets SecurityContext
│   └── service/
│       ├── AuthService.java             Register + login business logic
│       ├── BookService.java             findBooks with filters, featured, bestsellers
│       ├── AddressService.java
│       ├── OrderService.java            placeOrder, cancelOrder, giftPoints (48-hr rule)
│       └── RecommendationService.java   Category-based personalized recommendations
└── src/test/java/com/chapterandco/
    ├── ChapterAndCoApplicationTests.java
    ├── controller/
    │   ├── AuthControllerTest.java
    │   └── BookControllerTest.java
    ├── repository/
    │   └── UserRepositoryTest.java
    └── service/
        ├── AuthServiceTest.java
        ├── JwtTokenProviderTest.java
        └── OrderServiceTest.java
```

---

## Database

The Spring Boot module connects to the **same PostgreSQL database** as the Next.js frontend:
- Database: `chapter_and_co`
- `spring.jpa.hibernate.ddl-auto=validate` — Hibernate validates the schema but does **not** modify it
- All table names match the Prisma schema exactly (`users`, `books`, `orders`, etc.)
- The existing Prisma migrations and seed data are used as-is

---

## Security

- No real payment processing — all card flows are labelled **DEMO**
- Passwords hashed with BCrypt (cost 12)
- Server-side pricing: all prices recalculated from DB on checkout
- 48-hour cancellation window enforced in `OrderService.cancelOrder()`
- All user-scoped queries filter by `userId` to prevent IDOR
- JWT tokens are stateless — no session state stored

---

## AI Development Log

**Agentic IDE:** IBM Bob

**Prompt:** "Create a Spring Boot backend module that reuses the existing PostgreSQL schema from the Next.js frontend capstone. Implement REST APIs for books, categories, auth, cart/checkout, orders, cancellation, gift points and recommendations. Add Spring Security with JWT, SpringDoc Swagger UI, and JUnit + Mockito tests."

**Generated:** Full Maven project (pom.xml), 9 JPA entities, 6 repositories, 5 services, 5 controllers, 2 security classes, 2 config classes, 3 exception classes, 5 DTOs, 10 test classes — 50 tests, all passing.

**Human review:** Confirmed table name mappings match Prisma schema. Added `ddl-auto=validate` to protect existing data. Fixed `@WebMvcTest` security context for controller tests. Added `@MockBean JwtTokenProvider` and `UserRepository` to controller test slices.

## API testing

Insomnia collection, automated end-to-end script (57 checks on real PostgreSQL) and the latest results: see [`docs/API-TESTING.md`](../docs/API-TESTING.md).

## Agentic workflows

Agents, skills, custom mode, contract test and incident playbook: see [`docs/AGENTIC-WORKFLOW.md`](../docs/AGENTIC-WORKFLOW.md).
