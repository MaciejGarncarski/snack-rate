---
name: typescript-testing
description: Writes and reviews unit tests and integration tests for TypeScript (Vitest, Jest, node:test). Use this skill whenever you write, add, update, or review tests, or when asked whether something needs a test. Enforces useful tests only, and says an explicit NO when a test would be useless or would test implementation details.
---

# TypeScript Testing

A test is worth writing only if it fails when behavior breaks and stays green when the code is refactored without changing behavior. Everything else is noise that slows down refactoring.

Use the project's existing test runner, assertion style, file naming, and helpers. Check `package.json` scripts and the runner config first. Don't add a new test library.

### Finding and naming test files

Tests may live in many places. Look for all of these before deciding where a new test goes:

- Suffixes: `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`, `*.test.mts`, `*.test.cts`, `*.spec.mts`, `*.spec.cts`, and the `.js`/`.jsx` equivalents in mixed repos
- Integration/e2e suffixes: `*.integration.test.ts`, `*.integration.spec.ts`, `*.int.test.ts`, `*.e2e.test.ts`, `*.e2e-spec.ts` (common in NestJS)
- Folders: `__tests__/`, `test/`, `tests/`, `spec/`, `e2e/`, `integration/`
- Shared helpers: `test-utils/`, `testing/`, `__mocks__/`, `fixtures/`, `factories/`, `setup.ts`, `vitest.setup.ts`, `jest.setup.ts`
- Config that decides what runs: `vitest.config.*`, `jest.config.*`, `vitest.workspace.*`, `package.json` (`"jest"` key), and the `include`/`exclude`/`testMatch` patterns in them

Match the pattern the project already uses: colocated next to the source file, or in a mirrored `tests/` tree. If both exist, follow the one used for the same kind of code. Make sure a new file's name matches the runner's `include`/`testMatch` pattern, or it will silently never run.

## 1. The gate: say NO when a test is useless

Before writing any test, ask two questions:

1. **Would this fail if the behavior broke?** If not, it's useless.
2. **Would this fail if I refactored internals without changing behavior?** If yes, it tests implementation details.

If either answer is wrong, **do not write the test. Say so explicitly**, in this form:

> No test for `X`: <reason>.

Examples:

> No test for `getFullName`: it just concatenates two fields, so a test would repeat the implementation.
> No test for the `UserRow` type: TypeScript already checks this at compile time.
> No test for the private `normalize()` helper: it's covered through `parseInput()`, and testing it directly would lock in internals.

### Always say NO to these

- **Tests that mirror the implementation.** Recomputing the expected value with the same logic as the code (`expect(add(a, b)).toBe(a + b)`).
- **Trivial code.** Getters, setters, constants, pass-through wrappers, plain object construction.
- **Types.** Compile-time guarantees don't need runtime tests (unless testing runtime validation).
- **Third-party libraries and the language.** Don't test that `Array.map` or Zod works.
- **Private functions, internal state, call order.** Test through the public API.
- **Mock-only tests.** If the test mocks everything and asserts the mocks were called, it proves nothing about behavior.
- **Large snapshots** of rendered output or objects. Nobody reviews them and they break on any change. Assert on the specific fields that matter.
- **Duplicates.** If another test already covers the behavior, don't add a second one.
- **Assertions like `toBeTruthy()`, `toBeDefined()`, or "doesn't throw"** when a specific value can be checked.

Chasing a coverage number is not a reason to write a test.

## 2. Unit tests

Unit tests cover logic that can be exercised in isolation: pure functions, transformations, calculations, parsing, state machines, business rules.

### What to test

- Behavior from the caller's point of view: given input, expect output or effect.
- **Edge cases and boundaries:** empty input, zero, negative, max values, off-by-one, duplicates, unicode, null/undefined where the types allow them.
- **Failure paths:** assert the *specific* error, not just that something threw.
- Bugs that were fixed: add a regression test named after the scenario.

### How to write them

- One behavior per test. Name tests as behavior, not method names: `"returns 0 discount for inactive users"`, not `"test getDiscount"`.
- Arrange, act, assert. Keep each section visible, and keep the test short enough to read at a glance.
- Assert on concrete expected values written out literally. Don't compute them.
- Use `it.each` / `test.each` for the same behavior across many inputs.
- Each test is independent: no shared mutable state, no order dependence.
- Be deterministic: fake timers for time, seeded or injected randomness, no real network or filesystem.
- Mock only at boundaries (network, clock, filesystem, third-party services). **Never mock your own pure logic or the module under test.**
- Don't assert on call counts or arguments unless the call *is* the behavior (e.g. "sends exactly one email").

```ts
// Bad: mirrors implementation, vague name, computes expected value
it("works", () => {
  const price = 100;
  expect(applyDiscount(price, 0.2)).toBe(price - price * 0.2);
});

// Good: behavior name, literal expected values, table of cases
describe("applyDiscount", () => {
  it.each([
    { price: 100, rate: 0.2, expected: 80 },
    { price: 100, rate: 0, expected: 100 },
    { price: 0, rate: 0.5, expected: 0 },
  ])("$price at rate $rate gives $expected", ({ price, rate, expected }) => {
    expect(applyDiscount(price, rate)).toBe(expected);
  });

  it("rejects a rate above 1", () => {
    expect(() => applyDiscount(100, 1.5)).toThrow("rate must be between 0 and 1");
  });
});
```

```ts
// Bad: tests implementation details
it("calls the repository", async () => {
  const repo = { save: vi.fn() };
  await new UserService(repo).register(input);
  expect(repo.save).toHaveBeenCalledTimes(1);
  expect(internalHelper).toHaveBeenCalled();
});

// Good: tests an observable result with a simple fake
it("registers a user that can then be found", async () => {
  const repo = new InMemoryUserRepo();
  const service = new UserService(repo);

  await service.register({ email: "a@example.com" });

  expect(await repo.findByEmail("a@example.com")).toMatchObject({ email: "a@example.com" });
});
```

### Avoid duplicated test code

Repeating the same arrange/act/assert shape with different values is a smell. Remove the duplication, but keep each test readable on its own.

- **Same behavior, many inputs:** `it.each` / `test.each` / `describe.each`, or a typed array of cases. Don't copy-paste the test.
- **Generating cases from data:** array methods (`map`, `flatMap`, `filter`, `Object.entries`) are fine for building case lists or expected values from a source of truth, such as one test per enum member or per route. A `for...of` loop that registers `it(...)` blocks is also fine when `it.each` doesn't fit. Loops are allowed in tests where they remove duplication.
- **Checking many items in one test:** use `every`, `some`, `map`, or `expect.arrayContaining`/`toEqual` on a mapped array, instead of a hand-written assertion per item.
- **Repeated setup:** extract a builder or factory (`buildUser({ isActive: false })`) with sensible defaults and per-test overrides. Use `beforeEach` only for setup *every* test in the block needs.
- **Repeated assertions:** extract a small helper with a clear name (`expectValidationError(res, "email")`).
- **Don't over-DRY.** A reader should understand a test without chasing helpers. Keep the interesting input and the expected value visible inside the test, and don't hide logic in clever loops or helpers. If a loop contains `if`s, split it into separate tests instead.
- **Don't compute expectations in the loop.** Cases still carry literal expected values. Generating the *cases* from data is fine, but generating the *expected result* with the same logic as the code is the mirrored-implementation problem from section 1.

```ts
// Bad: copy-paste
it("rejects empty name", () => {
  expect(validate({ ...valid, name: "" })).toEqual({ ok: false, field: "name" });
});
it("rejects empty email", () => {
  expect(validate({ ...valid, email: "" })).toEqual({ ok: false, field: "email" });
});
it("rejects empty phone", () => {
  expect(validate({ ...valid, phone: "" })).toEqual({ ok: false, field: "phone" });
});

// Good: one test per case, no duplication
it.each(["name", "email", "phone"] as const)("rejects empty %s", (field) => {
  expect(validate({ ...valid, [field]: "" })).toEqual({ ok: false, field });
});
```

```ts
// Good: array methods to check many things at once, expected values still literal
it("returns only active users, newest first", async () => {
  const result = await listActiveUsers(db);

  expect(result.map((u) => u.name)).toEqual(["Cara", "Ben"]);
  expect(result.every((u) => u.isActive)).toBe(true);
});
```

## 3. Integration tests

Integration tests check that real pieces work *together*: route to handler to service to database, or a module with its real dependencies. They find wiring, configuration, query, and serialization bugs that unit tests can't.

### What to test

- **Key flows, not every permutation.** For each flow: the happy path plus the important failure paths (validation error, not found, unauthorized, conflict). Detailed edge cases belong in unit tests.
- Enter through the real public entry point (HTTP handler, CLI command, exported service function), not internals.
- Assert on outcomes: response status and body, plus persisted state or emitted side effects where relevant.

### How to write them

- Use real components inside your system (real handlers, services, real database or a realistic in-memory/test-container equivalent the project already uses).
- Fake only what you don't own and can't run: third-party HTTP APIs, payment providers, email. Use the project's existing HTTP mocking approach.
- Isolate every test: fresh or reset data per test (transaction rollback, truncate, unique IDs). No test may depend on another's data or order.
- Create test data with small factory/builder functions instead of copying large fixtures, and reuse request/auth helpers instead of repeating setup in every test.
- When many endpoints or roles share the same check (e.g. "returns 401 without a token"), loop over them with `it.each` instead of writing each test by hand.
- **No `sleep` or fixed timeouts.** Await the real condition, or poll with a timeout.
- Clean up resources in `afterEach`/`afterAll`: servers, connections, temp files, timers.
- Keep them separate from unit tests (own folder, suffix, or script) so unit tests stay fast. Use the project's existing convention.
- Keep their number small. Each one is slower and costlier to maintain than a unit test.

```ts
describe("POST /orders", () => {
  it("creates an order and persists it", async () => {
    const customer = await createCustomer(db);

    const res = await request(app)
      .post("/orders")
      .send({ customerId: customer.id, items: [{ sku: "A1", qty: 2 }] });

    expect(res.status).toBe(201);
    expect(await db.orders.findById(res.body.id)).toMatchObject({
      customerId: customer.id,
      status: "pending",
    });
  });

  it("returns 404 when the customer does not exist", async () => {
    const res = await request(app)
      .post("/orders")
      .send({ customerId: "missing", items: [{ sku: "A1", qty: 1 }] });

    expect(res.status).toBe(404);
  });
});
```

## 4. Unit or integration?

- Pure logic with many input cases: unit test.
- Behavior that depends on wiring, a database, serialization, or middleware: integration test.
- Don't cover the same behavior at both levels. Put detailed cases in unit tests and one or two proving the wiring in integration tests.

## 5. Before finishing

- Run the new tests and the existing suite. If you couldn't run them, say so.
- Confirm each new test can fail: temporarily break the behavior (or reason through it) and check the test would catch it.
- Checklist:
  - [ ] Does every test pass the gate in section 1?
  - [ ] Did I say "No test for X: reason" for what I skipped?
  - [ ] Are names behavior descriptions, and expected values literal?
  - [ ] Any mocks of my own code, call-count asserts, or large snapshots?
  - [ ] Any sleeps, shared state, or order dependence?
  - [ ] Is any test copy-pasted with only the values changed? Use `it.each`, array methods, or a builder.
  - [ ] Did I over-DRY: loops with branching, or helpers that hide what the test checks?
  - [ ] Is the new file named and placed so the runner actually picks it up?
  - [ ] Are integration tests few, with real wiring and isolated data?