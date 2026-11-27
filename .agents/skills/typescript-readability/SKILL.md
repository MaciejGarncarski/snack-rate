---
name: typescript-readability
description: Makes TypeScript code easy to read and maintain. Use this skill whenever you write, modify, refactor, or review TypeScript (.ts, .tsx, .mts, .cts), even for small edits. Covers naming, function shape, control flow, comments, abstraction level, and type-level clarity, with concrete before/after patterns.
---

# TypeScript Readability

The goal: a competent reader understands each function on the first pass, without scrolling or decoding.

Before finishing any TypeScript change, do a **readability pass**: reread your diff as if you were a reviewer seeing it cold, and fix anything below.

## 1. Flatten control flow

- Use early returns and guard clauses instead of nesting. Aim for max 2 levels of indentation inside a function.
- No nested ternaries. Use `if`/`else`, a lookup object, or a small function.
- Put the happy path at the lowest indentation.

```ts
// Hard to read
function getDiscount(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.orders > 10) {
        return 0.2;
      }
    }
  }
  return 0;
}

// Easy to read
function getDiscount(user: User | null) {
  if (!user?.isActive) return 0;
  if (user.orders <= 10) return 0;
  return 0.2;
}
```

## 2. Name things for what they mean

- Name by purpose, not type or mechanism: `unpaidInvoices`, not `filteredData` or `list2`.
- Booleans read as questions: `isExpired`, `hasAccess`, `canRetry`.
- Functions are verbs, values are nouns. Avoid `handle`, `process`, `doStuff`, `data`, `info`, `util` when something specific fits.
- Replace magic numbers and strings with named constants, or string-literal unions.
- Short names (`i`, `e`, `acc`) only for tiny scopes of 3 lines or fewer.

## 3. Keep functions the right size

- One function, one job, describable without "and".
- Don't split into many tiny one-use helpers either. If a reader must jump between 5 functions to follow one idea, inline some.
- Extract a function when it has a clear name that is easier to read than the code it replaces.
- Max about 3 parameters. Beyond that, take one options object with named fields.
- No boolean flag parameters. `render(true, false)` is unreadable. Use an options object or two functions.

```ts
// Unreadable at the call site
createUser(name, true, false);

// Readable
createUser({ name, isAdmin: true, sendWelcomeEmail: false });
```

## 4. Prefer declarative over imperative

- **No `for`, `while`, or `do...while` loops.** Use array methods: `map`, `filter`, `flatMap`, `find`, `some`, `every`, `reduce`, and `Object.fromEntries` / `Object.entries` for objects.
  - **Exception: test files.** Loops are fine there when they remove duplicated test code (see the `typescript-testing` skill).
- Pick the most specific method. `some`/`every`/`find` beat `filter(...).length`, and `flatMap` beats `map(...).flat()`.
- Use `reduce` only when you are really folding a collection into one value (sums, grouping). Don't use it to build arrays or objects that `map`, `filter`, or `Object.fromEntries` express more clearly.
- Don't mutate in a callback (`forEach` that pushes into an outer array). Return values instead.
- Keep chains short and readable. When a callback gets long or a chain passes about 3-4 steps, give the steps names: extract a named predicate or mapper, or assign an intermediate result to a well-named `const`.
- Avoid bitwise tricks, comma operators, or `&&` for side effects.
- Avoid over-abstraction. No factory, wrapper, or generic helper until there are at least 2-3 real uses.

```ts
// Dense: one long expression, no names
const total = orders.filter(o => o.status === "paid").reduce((s, o) => s + o.items.reduce((t, i) => t + i.price * i.qty, 0), 0);

// Clear: named steps, still declarative
const isPaid = (order: Order) => order.status === "paid";
const lineTotal = (item: OrderItem) => item.price * item.qty;

const total = orders
  .filter(isPaid)
  .flatMap(order => order.items)
  .reduce((sum, item) => sum + lineTotal(item), 0);
```

## 5. Comments explain why, not what

- Delete comments that restate the code (`// loop over users`, `// increment counter`).
- Write comments for intent, constraints, workarounds, and non-obvious decisions, e.g. why a retry exists or which bug a check avoids.
- Don't write JSDoc that just repeats the TypeScript types. Document exported APIs only when behavior isn't obvious from name and signature.
- If a comment is needed to explain what a block does, first try renaming or extracting instead.
- No commented-out code.

## 6. Make types help the reader

- Give important shapes a named type or interface instead of repeating inline object types.
- Prefer discriminated unions over optional-field bags, so states are explicit.
- Use string-literal unions instead of loose `string` when values are a known set.
- Let inference handle obvious local types. Annotate exported functions and boundaries so signatures document themselves.
- Avoid `any`, and avoid `as` and `!` unless you add a short comment on why they're safe.
- Don't build clever generic or conditional types for readability's sake. If the type needs a paragraph to explain, simplify it.

## 7. Error handling that doesn't bury the logic

- Don't wrap large blocks in `try`/`catch`. Wrap only the call that can fail.
- No empty `catch`. Handle, rethrow with context, or let it propagate.
- Don't add defensive checks for cases the types already rule out.

## 8. Structure and consistency

- Order within a file: imports, types/constants, main exports, then helpers. Keep related things close together.
- One style per file. Follow the surrounding code's naming, formatting, and patterns over your own preference.
- Prefer `const`. Avoid mutating arguments or hidden side effects, so a function's inputs and outputs are visible in its signature.
- Keep changes focused. Don't reformat or restructure code unrelated to the task.

## Readability pass checklist

Before finishing, check your diff for:

- [ ] Any nesting deeper than 2 levels, or nested ternaries?
- [ ] Any vague names (`data`, `result`, `handle`, `temp`)?
- [ ] Any function doing two jobs, or many tiny helpers used once?
- [ ] Any comment that restates the code?
- [ ] Any `for`/`while` loop, or a `forEach` that mutates outside state?
- [ ] Any long chain or dense one-liner that needs named steps?
- [ ] Any `any`, `as`, or `!` without a reason?
- [ ] Anything you had to reread to understand? Rewrite it.

If a rule here makes a specific piece of code *less* clear, use judgment and prefer clarity.