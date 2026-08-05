# 02 — Comment module deepening

**What to build:** Split the 374-line Comment repository by concern (identity, comments, ratings) into internal seams behind one interface. Unify duplicated identity logic.

**Blocked by:** #01 (oRPC migration)

**Status:** ready-for-agent

- [ ] Extract identity seam: unified `whereUserOrGuest` function replacing dual `whereUserOrGuest` / `whereUserOrGuestSql`
- [ ] Extract comments seam: comment querying logic (fetching comments, replies, assembling in memory)
- [ ] Extract ratings seam: rating CRUD + average recalculation
- [ ] Maintain same external interface (`upsertRating`, `getRating`, `recalculateAvgRating`, `removeRating`, `getRatingsForSnack`, `listCommentsForSnack`)
- [ ] Add tests for identity resolution through the repository interface
- [ ] Add tests for comment queries through the repository interface
- [ ] Add tests for rating operations through the repository interface
- [ ] Verify all existing callers still work
