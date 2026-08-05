# 04 — Dead value object integration

**What to build:** Integrate `SortOrder`, `ImgUrl`, and `Status.create()` into repositories where appropriate. Eliminate dead code.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Integrate `SortOrder` into `SnacksRepository.listSnacks` for sort order validation
- [ ] Integrate `ImgUrl` into `SnackImageService` for image URL validation
- [ ] Integrate `Status.create()` into `SnacksRepository` for status updates instead of string literals
- [ ] Add tests for `SortOrder.create()` validation (rejects negative numbers)
- [ ] Add tests for `ImgUrl.create()` validation (rejects invalid URLs)
- [ ] Add tests for `Status.create()` validation (rejects invalid status strings)
- [ ] Verify all repositories use value objects correctly
- [ ] Verify no dead value objects remain (all have at least one importer)
