// oxlint-disable max-lines
// oxlint-disable no-inline-comments
import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// snack_types
// ---------------------------------------------------------------------------

export const snackTypes = pgTable("snack_types", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// ---------------------------------------------------------------------------
// snack_items
// ---------------------------------------------------------------------------

export const snackItems = pgTable(
  "snack_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    typeId: uuid("type_id")
      .notNull()
      .references(() => snackTypes.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    barcode: text("barcode"),
    avgRating: decimal("avg_rating", { precision: 4, scale: 2 }).notNull().default("0"),
    ratingCount: integer("rating_count").notNull().default(0),
    status: text("status").notNull().default("pending"), // 'pending' | 'published' | 'rejected'
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("snack_items_barcode_unique_idx")
      .on(t.barcode)
      .where(sql`barcode IS NOT NULL AND deleted_at IS NULL`),
    uniqueIndex("snack_items_slug_unique_idx")
      .on(t.slug)
      .where(sql`slug IS NOT NULL AND deleted_at IS NULL`),
    index("snack_items_published_feed_idx")
      .on(t.status, t.createdAt.desc(), t.id.desc())
      .where(sql`deleted_at IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// snack_comments
// ---------------------------------------------------------------------------
// A comment on a snack item. A top-level comment (no parent) that carries a
// `rating` (1-5 stars) is a review; replies are plain comments referencing
// `parentCommentId`. One rated comment per author per snack.

export const snackComments = pgTable(
  "snack_comments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    authorId: text("author_id").notNull(), // user id (`user.id`) or guest uuidv7
    authorType: text("author_type").notNull(), // 'user' | 'guest'
    parentCommentId: uuid("parent_comment_id").references((): AnyPgColumn => snackComments.id, {
      onDelete: "cascade",
    }),
    rating: integer("rating"), // 1-10; only top-level comments (reviews) may carry one
    body: text("body"),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("snack_comments_author_snack_unique_idx")
      .on(t.authorId, t.snackItemId)
      .where(sql`rating IS NOT NULL AND deleted_at IS NULL`),
    index("snack_comments_snack_item_idx").on(t.snackItemId),
    index("snack_comments_parent_comment_idx").on(t.parentCommentId),
    check(
      "snack_comments_rating_check",
      sql`rating IS NULL OR (parent_comment_id IS NULL AND rating BETWEEN 1 AND 10)`,
    ),
    check("snack_comments_author_type_check", sql`author_type IN ('user', 'guest')`),
  ],
);

// ---------------------------------------------------------------------------
// snack_item_images
// ---------------------------------------------------------------------------

export const snackItemImages = pgTable(
  "snack_item_images",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    storageKey: text("storage_key").notNull(), // reference to the file in Garage
    type: text("type").notNull().default("default"), // 'default' | 'thumbnail'
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("snack_item_images_snack_item_id_idx")
      .on(t.snackItemId)
      .where(sql`deleted_at IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// comment_reactions
// ---------------------------------------------------------------------------

export const commentReactions = pgTable(
  "comment_reactions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => snackComments.id),
    type: text("type").notNull(), // 'like' | 'dislike' | 'heart' | 'laugh' | 'angry' | 'sad'
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("comment_reactions_user_comment_unique_idx").on(t.userId, t.commentId),
    index("comment_reactions_comment_id_idx").on(t.commentId),
  ],
);

// ---------------------------------------------------------------------------
// comment_reports
// ---------------------------------------------------------------------------

export const commentReports = pgTable(
  "comment_reports",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => snackComments.id),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("comment_reports_reporter_comment_unique_idx").on(t.reporterId, t.commentId)],
);

// ---------------------------------------------------------------------------
// bookmarks
// ---------------------------------------------------------------------------

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.snackItemId] })],
);

// ===========================================================================
// auth — Better Auth core schema
// https://better-auth.com/docs/concepts/database#core-schema
// Singular table names (`user`, `session`, `account`, `verification`) are
// required by the Better Auth Drizzle adapter defaults. TS keys stay
// camelCase while DB columns use snake_case, matching the rest of this file.
// ===========================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // App profile fields (declared as Better Auth `additionalFields` in auth config)
  username: text("username"),
  role: text("role").notNull().default("user"), // 'user' | 'moderator' | 'admin'
  status: text("status").notNull().default("active"), // 'active' | 'suspended' | 'banned'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ===========================================================================
// Relations
// ===========================================================================

// Relations have been moved to `src/db/relations.ts` to avoid circular imports
// and to follow Drizzle's recommended relations v2 layout.
