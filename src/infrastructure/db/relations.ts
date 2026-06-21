import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    reviews: r.many.snackReviews({ from: r.users.id, to: r.snackReviews.userId }),
    comments: r.many.comments({ from: r.users.id, to: r.comments.userId }),
    bookmarks: r.many.bookmarks({ from: r.users.id, to: r.bookmarks.userId }),
    emailVerifications: r.many.emailVerifications({
      from: r.users.id,
      to: r.emailVerifications.userId,
    }),
    reviewReactions: r.many.reviewReactions({ from: r.users.id, to: r.reviewReactions.userId }),
    commentReactions: r.many.commentReactions({ from: r.users.id, to: r.commentReactions.userId }),
    reviewReports: r.many.reviewReports({ from: r.users.id, to: r.reviewReports.reporterId }),
    commentReports: r.many.commentReports({ from: r.users.id, to: r.commentReports.reporterId }),
  },

  brands: {
    snackItems: r.many.snackItems({ from: r.brands.id, to: r.snackItems.brandId }),
  },

  snackItems: {
    brand: r.one.brands({ from: r.snackItems.brandId, to: r.brands.id }),
    type: r.one.snackTypes({ from: r.snackItems.typeId, to: r.snackTypes.id }),
    images: r.many.snackItemImages({ from: r.snackItems.id, to: r.snackItemImages.snackItemId }),
    reviews: r.many.snackReviews({ from: r.snackItems.id, to: r.snackReviews.snackItemId }),
    bookmarks: r.many.bookmarks({ from: r.snackItems.id, to: r.bookmarks.snackItemId }),
  },

  snackTypes: {
    snackItems: r.many.snackItems({ from: r.snackTypes.id, to: r.snackItems.typeId }),
  },

  snackReviews: {
    snackItem: r.one.snackItems({ from: r.snackReviews.snackItemId, to: r.snackItems.id }),
    user: r.one.users({ from: r.snackReviews.userId, to: r.users.id }),
    images: r.many.snackReviewImages({ from: r.snackReviews.id, to: r.snackReviewImages.reviewId }),
    comments: r.many.comments({ from: r.snackReviews.id, to: r.comments.reviewId }),
    reactions: r.many.reviewReactions({ from: r.snackReviews.id, to: r.reviewReactions.reviewId }),
    reports: r.many.reviewReports({ from: r.snackReviews.id, to: r.reviewReports.reviewId }),
  },

  comments: {
    review: r.one.snackReviews({ from: r.comments.reviewId, to: r.snackReviews.id }),
    user: r.one.users({ from: r.comments.userId, to: r.users.id }),
    parent: r.one.comments({
      from: r.comments.parentCommentId,
      to: r.comments.id,
      alias: "comment_replies",
    }),
    replies: r.many.comments({
      from: r.comments.id,
      to: r.comments.parentCommentId,
      alias: "comment_replies",
    }),
    reactions: r.many.commentReactions({ from: r.comments.id, to: r.commentReactions.commentId }),
    reports: r.many.commentReports({ from: r.comments.id, to: r.commentReports.commentId }),
  },

  snackItemImages: {
    snackItem: r.one.snackItems({ from: r.snackItemImages.snackItemId, to: r.snackItems.id }),
  },

  snackReviewImages: {
    review: r.one.snackReviews({ from: r.snackReviewImages.reviewId, to: r.snackReviews.id }),
  },

  reviewReactions: {
    user: r.one.users({ from: r.reviewReactions.userId, to: r.users.id }),
    review: r.one.snackReviews({ from: r.reviewReactions.reviewId, to: r.snackReviews.id }),
  },

  commentReactions: {
    user: r.one.users({ from: r.commentReactions.userId, to: r.users.id }),
    comment: r.one.comments({ from: r.commentReactions.commentId, to: r.comments.id }),
  },

  reviewReports: {
    reporter: r.one.users({ from: r.reviewReports.reporterId, to: r.users.id }),
    review: r.one.snackReviews({ from: r.reviewReports.reviewId, to: r.snackReviews.id }),
  },

  commentReports: {
    reporter: r.one.users({ from: r.commentReports.reporterId, to: r.users.id }),
    comment: r.one.comments({ from: r.commentReports.commentId, to: r.comments.id }),
  },

  emailVerifications: {
    user: r.one.users({ from: r.emailVerifications.userId, to: r.users.id }),
  },

  bookmarks: {
    user: r.one.users({ from: r.bookmarks.userId, to: r.users.id }),
    snackItem: r.one.snackItems({ from: r.bookmarks.snackItemId, to: r.snackItems.id }),
  },
}));
