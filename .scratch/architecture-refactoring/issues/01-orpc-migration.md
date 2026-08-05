# 01 — oRPC migration

**What to build:** Migrate all TanStack server functions to oRPC procedures, grouped by resource. Update router and all callers. Delete `createServerFn` imports.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Migrate `rateSnackFn`, `getRatingsForSnackFn`, `removeRatingFn` to oRPC procedures under `comments.*`
- [ ] Migrate `getSnackBySlugFn`, `getSearchedItems` to oRPC procedures under `snacks.*`
- [ ] Migrate `getCaptcha` to oRPC procedure under `captcha.*`
- [ ] Migrate `ensureGuestId` to oRPC procedure under `guest.*`
- [ ] Update router (`orpc/router/index.ts`) to register all new procedures
- [ ] Update all callers (queries, hooks, components) to use oRPC client
- [ ] Delete all `createServerFn` imports
- [ ] Verify oRPC client auto-derives correct types
- [ ] Run existing tests to verify no regressions
