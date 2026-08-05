import { snackComments } from "@snack-rate/db-schema/schema";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { TableFilter } from "drizzle-orm";

export type Identity = { column: "userId" | "guestId"; value: string };

/**
 * Resolve user or guest identity from nullable parameters.
 * This is the single source of truth for identity resolution.
 */
export function resolveIdentity(userId: string | null, guestId: string | null): Identity {
  if (userId) return { column: "userId", value: userId };
  if (!guestId) throw new Error("Either userId or guestId must be provided");
  return { column: "guestId", value: guestId };
}

/**
 * Build a TableFilter for Drizzle's query API (findFirst, findMany).
 * Use this for query options that accept a `where` object.
 */
export function whereUserOrGuest(
  snackItemId: string,
  userId: string | null,
  guestId: string | null,
): TableFilter<typeof snackComments> {
  const identity = resolveIdentity(userId, guestId);
  return identity.column === "userId"
    ? {
        snackItemId,
        userId: identity.value,
        rating: { isNotNull: true },
        deletedAt: { isNull: true },
      }
    : {
        snackItemId,
        guestId: identity.value,
        rating: { isNotNull: true },
        deletedAt: { isNull: true },
      };
}

/**
 * Build a SQL expression for Drizzle's SQL API (update, delete).
 * Use this for `.where()` clauses in update/delete statements.
 */
export function whereUserOrGuestSql(
  snackItemId: string,
  userId: string | null,
  guestId: string | null,
) {
  const identity = resolveIdentity(userId, guestId);
  const column = identity.column === "userId" ? snackComments.userId : snackComments.guestId;
  return and(
    eq(snackComments.snackItemId, snackItemId),
    eq(column, identity.value),
    isNotNull(snackComments.rating),
    isNull(snackComments.deletedAt),
  );
}
