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

| Property | Default | Description |
|----------|---------|-------------|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/chapter_and_co` | Shared DB |
| `spring.datasource.username` | `admin` | PostgreSQL username |
| `spring.datasource.password` | `admin` | PostgreSQL password |
| `app.jwt.secret` | (see file) | Change in production |
| `app.jwt.expiration-ms` | `86400000` | 24 hours |
| `server.port` | `8080` | Spring Boot port |

---

## REST API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user, returns JWT |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/books` | — | List books (search, category, sort, page) |
| GET | `/api/v1/books/featured` | — | Featured books |
| GET | `/api/v1/books/bestsellers` | — | Bestselling books |
| GET | `/api/v1/books/{slug}` | — | Book detail by slug |
| GET | `/api/v1/categories` | — | All categories |
| GET | `/api/v1/categories/{slug}` | — | Category by slug |
| GET | `/api/v1/recommendations` | Optional | Personalized recommendations |
| GET | `/api/v1/addresses` | ✓ Bearer | List user addresses |
| POST | `/api/v1/addresses` | ✓ Bearer | Create address |
| POST | `/api/v1/checkout` | ✓ Bearer | Place order (server-side pricing) |
| GET | `/api/v1/orders` | ✓ Bearer | Order history |
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

### Test results (40 / 40 passing)

| Suite | Tests | Type |
|-------|-------|------|
| `AuthServiceTest` | 5 | Unit (Mockito) |
| `OrderServiceTest` | 11 | Unit (Mockito) |
| `JwtTokenProviderTest` | 6 | Unit |
| `UserRepositoryTest` | 5 | DB persistence (`@DataJpaTest`) |
| `AuthControllerTest` | 6 | API (`@WebMvcTest` + MockMvc) |
| `BookControllerTest` | 6 | API (`@WebMvcTest` + MockMvc) |
| `ChapterAndCoApplicationTests` | 1 | Spring context load |
| **Total** | **40** | **All passing** |

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

**Generated:** Full Maven project (pom.xml), 9 JPA entities, 6 repositories, 5 services, 5 controllers, 2 security classes, 2 config classes, 3 exception classes, 5 DTOs, 7 test classes — 40 tests, all passing.

**Human review:** Confirmed table name mappings match Prisma schema. Added `ddl-auto=validate` to protect existing data. Fixed `@WebMvcTest` security context for controller tests. Added `@MockBean JwtTokenProvider` and `UserRepository` to controller test slices.
