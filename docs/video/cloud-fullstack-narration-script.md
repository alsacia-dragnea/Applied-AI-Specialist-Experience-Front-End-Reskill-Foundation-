# Video Narration Script — Cloud FullStack Capstone
## Chapter & Co. Spring Boot Backend — ~3 minutes

---

### SCENE 1 — Project intro (0:00–0:25)

"Hi, I'm presenting my Cloud FullStack Capstone — Chapter & Co., a full-stack eCommerce bookstore. In the Front-End capstone I built the complete Next.js frontend. For this capstone, I've added a production-grade Java 21 Spring Boot backend — generated and refined with IBM Bob — that connects to the same PostgreSQL database. Let me walk you through the architecture, the API, and the test results."

---

### SCENE 2 — Architecture overview (0:25–0:55)

"Here's the two-backend architecture. The Next.js app runs on port 3000 and serves the React frontend. The new Spring Boot backend runs on port 8080 and exposes a full REST API. Both connect to the same PostgreSQL chapter-and-co database. The Spring Boot backend uses Spring Data JPA entities mapped to the exact same tables Prisma created — no schema changes, no data migration needed."

*(Show: architecture diagram or the README structure section)*

---

### SCENE 3 — IBM Bob prompt (0:55–1:20)

"I used IBM Bob to generate the entire backend. Here's the master prompt I gave it: 'Create a Spring Boot backend module that reuses the existing PostgreSQL schema. Implement REST APIs for books, categories, auth, checkout, orders, cancellation, gift points and recommendations. Add Spring Security with JWT, SpringDoc Swagger UI, and JUnit + Mockito tests.' Bob generated 135 files — all JPA entities, repositories, services, controllers, security and tests. I reviewed every file, confirmed table name mappings, and fixed the WebMvcTest security context configuration."

*(Show: IBM Bob chat, the prompt, generated files in VS Code)*

---

### SCENE 4 — Spring Boot project structure (1:20–1:40)

"The backend module lives in backend/ inside the same repository. It has a standard Maven layout: entities in the entity package mapped to the Prisma tables, repositories using Spring Data JPA, services containing the business logic, and REST controllers annotated with Spring Web. The GlobalExceptionHandler maps domain exceptions to HTTP status codes cleanly."

*(Show: VS Code file tree — entity/, repository/, service/, controller/)*

---

### SCENE 5 — Swagger UI live demo (1:40–2:00)

"With Spring Boot running on port 8080, I can open the Swagger UI at localhost:8080/swagger-ui.html. All 16 endpoints are documented here with request/response schemas, authentication requirements, and example payloads. I can test the API directly from the browser — let me call GET /api/v1/books and see the paginated response from the database."

*(Show: browser at localhost:8080/swagger-ui.html, expand books endpoint, try it out)*

---

### SCENE 6 — Spring Security + JWT demo (2:00–2:15)

"Security is handled by Spring Security in stateless mode. When I POST to /api/v1/auth/login with the demo credentials, I get back a JWT token. I copy that token and use it as a Bearer header for protected endpoints like GET /api/v1/orders. If I call a protected endpoint without the token, Spring Security returns a 401 immediately."

*(Show: Swagger UI — login call returning token, then orders call with/without token)*

---

### SCENE 7 — Test results (2:15–2:40)

"Here's what matters most for the capstone: 40 tests, all passing. I have unit tests for AuthService and OrderService using Mockito — testing registration, login errors, 48-hour cancellation, gift points balance, stock validation. I have @DataJpaTest persistence tests for UserRepository. And I have @WebMvcTest controller tests using MockMvc that verify all HTTP status codes — 201 for successful register, 422 for invalid input, 404 for unknown slugs. Let me run them live."

*(Show: terminal — mvn test output, Tests run: 40, Failures: 0)*

---

### SCENE 8 — GitHub Pull Request (2:40–3:00)

"The entire Spring Boot module is on a separate feature branch — feature/cloud-fullstack-spring-boot — keeping it completely isolated from the frontend capstone branch. Here's the Pull Request on GitHub. The commit message documents everything that was generated and the human review steps. The PR is ready for review without overwriting any existing work. That's Chapter & Co. — Cloud FullStack capstone, built with IBM Bob."

*(Show: GitHub PR page, file diff, commit message)*

---

*Total: ~3 minutes | 8 scenes*
