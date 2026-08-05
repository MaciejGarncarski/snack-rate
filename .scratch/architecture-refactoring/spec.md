# Spec: Architecture Refactoring — oRPC Migration + Deepening

## Problem Statement

The codebase has four architectural issues causing friction:

1. **Transport inconsistency** — The Comment and Catalogue features mix oRPC procedures and TanStack server functions. Two parallel API mechanisms, two query key strategies, two error handling patterns.

2. **Shallow Comment module** — A 374-line repository mixes identity resolution, comment queries, rating CRUD, and average recalculation. Understanding one concept requires bouncing between four concerns in one file.

3. **Captcha presentation leakage** — The Captcha transport handler is 247 lines — 200+ are SVG rendering logic (wavy lines, noise dots, blobs, character positioning) that has nothing to do with HTTP, cookies, or crypto.

4. **Dead value objects** — `SortOrder`, `ImgUrl`, and `Status.create()` are defined but never imported or used in application code.

## Solution

Refactor in four phases, each delivered as a separate PR:

1. **oRPC migration** — Convert all server functions to oRPC procedures, grouped by resource. Delete `createServerFn()` imports.

2. **Comment module deepening** — Split the 374-line repository by concern (identity, comments, ratings) into internal seams behind one interface.

3. **Captcha renderer extraction** — Extract 200+ lines of SVG rendering into a pure function `renderCaptcha(code: string) → string`.

4. **Dead value object integration** — Integrate `SortOrder`, `ImgUrl`, and `Status.create()` into repositories where appropriate.

## User Stories

### oRPC Migration

1. As a developer, I want all API endpoints to use oRPC procedures, so that there is one transport mechanism to learn
2. As a developer, I want procedures grouped by resource (`snacks.*`, `comments.*`, `captcha.*`), so that the API surface is organized logically
3. As a developer, I want the oRPC client to auto-derive types from the router, so that I don't need to maintain type definitions manually
4. As a developer, I want error handling middleware to apply uniformly across all endpoints, so that error behavior is consistent
5. As a developer, I want query keys to be managed by oRPC's TanStack Query integration, so that I don't need manual key strategies
6. As a developer, I want to delete all `createServerFn` imports, so that there is no confusion about which transport to use

### Comment Module Deepening

7. As a developer, I want the Comment module to have one interface, so that I can understand it without reading the implementation
8. As a developer, I want identity resolution (user vs. guest) to be a separate internal seam, so that identity logic doesn't leak into queries
9. As a developer, I want comment queries to be a separate internal seam, so that read operations are isolated from write operations
10. As a developer, I want rating operations to be a separate internal seam, so that rating CRUD is isolated from comment queries
11. As a developer, I want the duplicated `whereUserOrGuest` / `whereUserOrGuestSql` functions unified, so that identity logic isn't implemented twice
12. As a developer, I want average recalculation to be part of the rating seam, so that it's co-located with the operations that trigger it
13. As a developer, I want to test the Comment module through its interface, so that tests exercise the same seam callers use

### Captcha Renderer Extraction

14. As a developer, I want SVG rendering to be a pure function `renderCaptcha(code: string) → string`, so that it's testable without HTTP
15. As a developer, I want the Captcha transport handler to be a thin coordinator (generate → sign → set cookie → render), so that it's easy to understand
16. As a developer, I want the renderer to be deterministic (same code → same SVG), so that visual bugs are reproducible
17. As a developer, I want the renderer to have no framework dependencies, so that it can be tested in isolation

### Dead Value Object Integration

18. As a developer, I want `SortOrder` to be used in repository sort operations, so that sort order validation is enforced at the domain layer
19. As a developer, I want `ImgUrl` to be used in image URL handling, so that URL format validation is enforced at the domain layer
20. As a developer, I want `Status.create()` to be used in repository status updates, so that status values are validated at the domain layer
21. As a developer, I want all value objects to have at least one importer, so that dead code is eliminated

## Implementation Decisions

### oRPC Migration

- **Procedure pattern:** Use `os.input(schema).handler(fn)` — same pattern already used in `snacks.server.ts` and `comments.server.ts`
- **Router grouping:** `{ snacks: { list, create, listTypes, getBySlug, getRatings, search }, comments: { list, rate, removeRating }, captcha: { get }, guest: { ensureId } }`
- **Cookie handling:** `getCookie`/`setCookie` from `@tanstack/react-start/server` work inside oRPC handlers (verified by `verify-captcha.server.ts`)
- **Client:** No changes needed — `orpc/client.ts` auto-derives types from the router object
- **Query layer:** Comments will use oRPC's `infiniteOptions` for pagination (already working)

### Comment Module Deepening

- **Internal seams:** Identity, Comments, Ratings — three concerns behind one `createCommentsRepository` interface
- **Identity seam:** Unified `whereUserOrGuest` function returning a Drizzle filter, replacing the current dual implementation
- **Interface shape:** The repository exposes the same 6 methods as today (`upsertRating`, `getRating`, `recalculateAvgRating`, `removeRating`, `getRatingsForSnack`, `listCommentsForSnack`), but internally delegates to the three seams
- **No schema changes:** The DB already supports the domain model (comments with optional ratings via CHECK constraint)

### Captcha Renderer Extraction

- **Interface:** `renderCaptcha(code: string): string` — pure function, no options, no randomness
- **Location:** `features/captcha/renderer.ts` — new file alongside `captcha.ts`
- **Transport handler:** Becomes ~30 lines: generate code → sign → set cookie → call renderer → return SVG
- **Determinism:** Same code produces same SVG (no Math.random, no timestamps)

### Dead Value Object Integration

- **SortOrder:** Use in `SnacksRepository.listSnacks` for sort order validation
- **ImgUrl:** Use in `SnackImageService` for image URL validation
- **Status:** Use in `SnacksRepository` for status updates instead of string literals

## Testing Decisions

- **Approach:** TDD — write tests first for each change, red-green-refactor
- **Test surface:** Each module is tested through its interface (the seam callers use)
- **Comment module:** Test identity resolution, comment queries, and rating operations through the repository interface
- **Captcha renderer:** Test that `renderCaptcha(code)` returns valid SVG and is deterministic
- **Value objects:** Test that `SortOrder.create()`, `ImgUrl.create()`, `Status.create()` validate correctly
- **oRPC migration:** Test that procedures are registered in the router and callable via the client
- **Prior art:** Existing tests in `features/shared/value-objects/tests/` and `features/captcha/tests/` provide patterns

## Out of Scope

- Database schema changes (not needed)
- Backwards compatibility (API is internal only)
- Authentication/authorization changes
- UI component changes (transport layer only)
- Performance optimization
- Documentation updates

## Further Notes

- **Order:** oRPC migration first (unifies transport), then Comment deepening (benefits from unified transport), then Captcha renderer + dead value objects (smaller wins)
- **PRs:** Separate PRs for each phase
- **Risk points:** `get-captcha.server.tsx` and `guest-id.server.ts` use TanStack Start's server-side cookie APIs — verified to work in oRPC context by `verify-captcha.server.ts`
