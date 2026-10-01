## Full backlog plan: non-flaky, behavior-focused Fastify tests

### Objective
Build a test suite that gives strong coverage without depending on implementation details. The primary goal is to protect end-user behavior and keep the suite stable across refactors.

### Test strategy
#### 1. Route-level tests are the primary safety net
Use the real Fastify app with `app.inject` for user-visible flows.

Cover these areas:
- unauthenticated access to protected API routes is rejected
- authenticated access to protected routes succeeds
- role-based authorization denies unauthorized users and allows authorized users
- home route returns expected welcome message
- API docs or route responses behave as expected for real consumers

#### 2. Plugin-level tests only where logic is valuable to isolate
Add direct tests for logic-heavy plugins, but keep them small and behavior-oriented.

High-value cases:
- password hashing generates a valid hash
- password comparison returns true for the correct password
- password comparison returns false for the wrong password
- required environment config is enforced
- default config is applied when optional values are missing

#### 3. Repository tests are integration tests
For DB-backed repositories, prefer isolated test database behavior over mocking internals.

Tests should validate:
- user lookup by email works
- user creation succeeds with expected public output
- role lookup for a user returns expected roles
- invalid inputs fail validation without leaking internals

### Anti-patterns to avoid
- testing `decorate` calls directly
- asserting plugin registration order
- asserting Fastify internal object shape
- testing SQL strings or Drizzle internals
- mocking away the app and only testing mocks

### TDD workflow
1. Write failing test for the user-visible behavior.
2. Implement the route or plugin behavior.
3. Run the focused suite.
4. Refactor only after the behavior is green.
5. Add additional tests only when there is a real business reason to cover a branch.

### Suggested order of work
1. ~~Fix the current skipped API tests and turn them into active specs.~~
2. ~~Add the unauthenticated and authenticated API access tests.~~
3. Add role authorization tests for protected routes.
4. Add password-manager unit tests.
5. Add config validation tests.
6. Add repository integration tests if the DB flows remain untested.
7. Add coverage gate only after behavior is stable.

### Definition of done
- No skipped placeholder tests remain for active app behavior.
- The coverage focus is on public API outcomes and pure logic.
- The suite is non-flaky and stable under refactors.
- New behavior is introduced with failing tests first.
