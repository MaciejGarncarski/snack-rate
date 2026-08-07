import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    commentReactions: r.many.commentReactions({ from: r.users.id, to: r.commentReactions.userId }),
    commentReports: r.many.commentReports({ from: r.users.id, to: r.commentReports.reporterId }),
    bookmarks: r.many.bookmarks({ from: r.users.id, to: r.bookmarks.userId }),
    emailVerifications: r.many.emailVerifications({
      from: r.users.id,
      to: r.emailVerifications.userId,
    }),
  },

  snackTypes: {
    snackItems: r.many.snackItems({ from: r.snackTypes.id, to: r.snackItems.typeId }),
  },

  snackItems: {
    type: r.one.snackTypes({ from: r.snackItems.typeId, to: r.snackTypes.id }),
    images: r.many.snackItemImages({ from: r.snackItems.id, to: r.snackItemImages.snackItemId }),
    comments: r.many.snackComments({ from: r.snackItems.id, to: r.snackComments.snackItemId }),
    bookmarks: r.many.bookmarks({ from: r.snackItems.id, to: r.bookmarks.snackItemId }),
  },

  snackComments: {
    snackItem: r.one.snackItems({ from: r.snackComments.snackItemId, to: r.snackItems.id }),
    parent: r.one.snackComments({
      from: r.snackComments.parentCommentId,
      to: r.snackComments.id,
      alias: "comment_replies",
    }),
    replies: r.many.snackComments({
      from: r.snackComments.id,
      to: r.snackComments.parentCommentId,
      alias: "comment_replies",
    }),
    reactions: r.many.commentReactions({
      from: r.snackComments.id,
      to: r.commentReactions.commentId,
    }),
    reports: r.many.commentReports({ from: r.snackComments.id, to: r.commentReports.commentId }),
  },

  snackItemImages: {
    snackItem: r.one.snackItems({ from: r.snackItemImages.snackItemId, to: r.snackItems.id }),
  },

  commentReactions: {
    user: r.one.users({ from: r.commentReactions.userId, to: r.users.id }),
    comment: r.one.snackComments({ from: r.commentReactions.commentId, to: r.snackComments.id }),
  },

  commentReports: {
    reporter: r.one.users({ from: r.commentReports.reporterId, to: r.users.id }),
    comment: r.one.snackComments({ from: r.commentReports.commentId, to: r.snackComments.id }),
  },

  emailVerifications: {
    user: r.one.users({ from: r.emailVerifications.userId, to: r.users.id }),
  },

  bookmarks: {
    user: r.one.users({ from: r.bookmarks.userId, to: r.users.id }),
    snackItem: r.one.snackItems({ from: r.bookmarks.snackItemId, to: r.snackItems.id }),
  },
}));
