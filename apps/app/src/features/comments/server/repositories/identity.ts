import { snackComments } from "@snack-rate/db-schema/schema";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { TableFilter } from "drizzle-orm";

export type AuthorType = "user" | "guest";

export type Identity = { authorId: string; authorType: AuthorType };

/**
 * Resolve author identity from nullable parameters.
 * This is the single source of truth for identity resolution.
 */
export function resolveIdentity(authorId: string | null, authorType: string | null): Identity {
  if (authorId && authorType === "user") return { authorId, authorType: "user" };
  if (authorId && authorType === "guest") return { authorId, authorType: "guest" };
  throw new Error("Either authorId with authorType must be provided");
}

/**
 * Build a TableFilter for Drizzle's query API (findFirst, findMany).
 * Use this for query options that accept a `where` object.
 */
export function whereAuthor(
  snackItemId: string,
  authorId: string | null,
  authorType: string | null,
): TableFilter<typeof snackComments> {
  const identity = resolveIdentity(authorId, authorType);
  return {
    snackItemId,
    authorId: identity.authorId,
    authorType: identity.authorType,
    rating: { isNotNull: true },
    deletedAt: { isNull: true },
  };
}

/**
 * Build a SQL expression for Drizzle's SQL API (update, delete).
 * Use this for `.where()` clauses in update/delete statements.
 */
export function whereAuthorSql(
  snackItemId: string,
  authorId: string | null,
  authorType: string | null,
) {
  const identity = resolveIdentity(authorId, authorType);
  return and(
    eq(snackComments.snackItemId, snackItemId),
    eq(snackComments.authorId, identity.authorId),
    eq(snackComments.authorType, identity.authorType),
    isNotNull(snackComments.rating),
    isNull(snackComments.deletedAt),
  );
}
