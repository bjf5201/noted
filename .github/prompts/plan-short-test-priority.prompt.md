## Short plan: fast, high-value TDD for this Fastify app

### Goal
Increase confidence quickly with stable, end-user-focused tests before doing more feature work.

### Priority order
1. Replace skipped API tests with real behavior checks.
2. Add tests for unauthenticated request denial.
3. Add tests for authenticated API success.
4. Add tests for role-based authorization.
5. Add a small plugin-level test set for password hashing/comparison.
6. Add config validation tests only if environment requirements grow more complex.

### Rules
- Test real HTTP behavior with `app.inject`.
- Assert status codes and payloads, not plugin internals.
- Keep repository tests as integration tests, not implementation-detail tests.
- Do not test autoload order, decorator existence, or Fastify registration internals.

### Scope
Focus first on the flows that matter to users:
- API root access while logged out
- API root access while logged in
- authorization checks for role-protected routes
- password verification behavior

### Done when
- The skipped placeholder tests are replaced with real active specs.
- The core API behavior is covered in a stable, black-box way.
- Future features are added with failing tests first.
