// oxlint-disable no-inline-comments
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  primaryKey,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    profilePictureUrl: text("profile_picture_url"),
    role: text("role").notNull().default("user"), // 'user' | 'moderator' | 'admin'
    status: text("status").notNull().default("active"), // 'active' | 'suspended' | 'banned'
    emailVerifiedAt: timestamp("email_verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    // Partial unique index — enforced at DB level via raw SQL or migration
    uniqueIndex("users_email_unique_idx")
      .on(t.email)
      .where(sql`deleted_at IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// brands
// ---------------------------------------------------------------------------

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ---------------------------------------------------------------------------
// snack_items
// ---------------------------------------------------------------------------

export const snackItems = pgTable(
  "snack_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brands.id),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }),
    barcode: text("barcode"),
    avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
    bookmarkCount: integer("bookmark_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("snack_items_barcode_unique_idx")
      .on(t.barcode)
      .where(sql`barcode IS NOT NULL AND deleted_at IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(), // lowercase, hyphenated e.g. sour-cream
});

// ---------------------------------------------------------------------------
// snack_tags  (join table)
// ---------------------------------------------------------------------------

export const snackTags = pgTable(
  "snack_tags",
  {
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.snackItemId, t.tagId] })],
);

// ---------------------------------------------------------------------------
// snack_reviews
// ---------------------------------------------------------------------------

export const snackReviews = pgTable(
  "snack_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(), // CHECK: 1–5
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    uniqueIndex("snack_reviews_snack_user_unique_idx")
      .on(t.snackItemId, t.userId)
      .where(sql`deleted_at IS NULL`),
    index("snack_reviews_snack_item_id_idx").on(t.snackItemId),
    index("snack_reviews_user_id_idx").on(t.userId),
  ],
);

// ---------------------------------------------------------------------------
// comments
// ---------------------------------------------------------------------------

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => snackReviews.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    parentCommentId: uuid("parent_comment_id").references((): AnyPgColumn => comments.id, {
      onDelete: "cascade",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("comments_review_id_idx").on(t.reviewId),
    index("comments_parent_comment_id_idx").on(t.parentCommentId),
  ],
);

// ---------------------------------------------------------------------------
// snack_item_images
// ---------------------------------------------------------------------------

export const snackItemImages = pgTable(
  "snack_item_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
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
// snack_review_images
// ---------------------------------------------------------------------------

export const snackReviewImages = pgTable(
  "snack_review_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => snackReviews.id),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("snack_review_images_review_id_idx")
      .on(t.reviewId)
      .where(sql`deleted_at IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// review_reactions
// ---------------------------------------------------------------------------

export const reviewReactions = pgTable(
  "review_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => snackReviews.id),
    type: text("type").notNull(), // 'like' | 'fire' | 'meh'
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("review_reactions_user_review_unique_idx").on(t.userId, t.reviewId),
    index("review_reactions_review_id_idx").on(t.reviewId),
  ],
);

// ---------------------------------------------------------------------------
// comment_reactions
// ---------------------------------------------------------------------------

export const commentReactions = pgTable(
  "comment_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id),
    type: text("type").notNull(), // 'like' | 'fire' | 'meh'
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("comment_reactions_user_comment_unique_idx").on(t.userId, t.commentId),
    index("comment_reactions_comment_id_idx").on(t.commentId),
  ],
);

// ---------------------------------------------------------------------------
// review_reports
// ---------------------------------------------------------------------------

export const reviewReports = pgTable(
  "review_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => snackReviews.id),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("review_reports_reporter_review_unique_idx").on(t.reporterId, t.reviewId)],
);

// ---------------------------------------------------------------------------
// comment_reports
// ---------------------------------------------------------------------------

export const commentReports = pgTable(
  "comment_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id),
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
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    snackItemId: uuid("snack_item_id")
      .notNull()
      .references(() => snackItems.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.snackItemId] })],
);

// ===========================================================================
// auth
// ===========================================================================

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
  },
  (t) => [index("password_resets_user_id_idx").on(t.userId)],
);

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
  },
  (t) => [index("email_verifications_user_id_idx").on(t.userId)],
);

// ===========================================================================
// Relations
// ===========================================================================

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(snackReviews),
  comments: many(comments),
  bookmarks: many(bookmarks),
  reviewReactions: many(reviewReactions),
  commentReactions: many(commentReactions),
  reviewReports: many(reviewReports),
  commentReports: many(commentReports),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  snackItems: many(snackItems),
}));

export const snackItemsRelations = relations(snackItems, ({ one, many }) => ({
  brand: one(brands, { fields: [snackItems.brandId], references: [brands.id] }),
  images: many(snackItemImages),
  tags: many(snackTags),
  reviews: many(snackReviews),
  bookmarks: many(bookmarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  snackTags: many(snackTags),
}));

export const snackTagsRelations = relations(snackTags, ({ one }) => ({
  snackItem: one(snackItems, {
    fields: [snackTags.snackItemId],
    references: [snackItems.id],
  }),
  tag: one(tags, { fields: [snackTags.tagId], references: [tags.id] }),
}));

export const snackReviewsRelations = relations(snackReviews, ({ one, many }) => ({
  snackItem: one(snackItems, {
    fields: [snackReviews.snackItemId],
    references: [snackItems.id],
  }),
  user: one(users, {
    fields: [snackReviews.userId],
    references: [users.id],
  }),
  images: many(snackReviewImages),
  comments: many(comments),
  reactions: many(reviewReactions),
  reports: many(reviewReports),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  review: one(snackReviews, {
    fields: [comments.reviewId],
    references: [snackReviews.id],
  }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, { relationName: "comment_replies" }),
  reactions: many(commentReactions),
  reports: many(commentReports),
}));

export const snackItemImagesRelations = relations(snackItemImages, ({ one }) => ({
  snackItem: one(snackItems, {
    fields: [snackItemImages.snackItemId],
    references: [snackItems.id],
  }),
}));

export const snackReviewImagesRelations = relations(snackReviewImages, ({ one }) => ({
  review: one(snackReviews, {
    fields: [snackReviewImages.reviewId],
    references: [snackReviews.id],
  }),
}));

export const reviewReactionsRelations = relations(reviewReactions, ({ one }) => ({
  user: one(users, {
    fields: [reviewReactions.userId],
    references: [users.id],
  }),
  review: one(snackReviews, {
    fields: [reviewReactions.reviewId],
    references: [snackReviews.id],
  }),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
}));

export const reviewReportsRelations = relations(reviewReports, ({ one }) => ({
  reporter: one(users, {
    fields: [reviewReports.reporterId],
    references: [users.id],
  }),
  review: one(snackReviews, {
    fields: [reviewReports.reviewId],
    references: [snackReviews.id],
  }),
}));

export const commentReportsRelations = relations(commentReports, ({ one }) => ({
  reporter: one(users, {
    fields: [commentReports.reporterId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentReports.commentId],
    references: [comments.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  snackItem: one(snackItems, {
    fields: [bookmarks.snackItemId],
    references: [snackItems.id],
  }),
}));
