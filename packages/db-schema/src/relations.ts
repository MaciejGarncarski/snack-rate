import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    commentReactions: r.many.commentReactions({ from: r.user.id, to: r.commentReactions.userId }),
    commentReports: r.many.commentReports({ from: r.user.id, to: r.commentReports.reporterId }),
    bookmarks: r.many.bookmarks({ from: r.user.id, to: r.bookmarks.userId }),
  },

  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },

  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id }),
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
    user: r.one.user({ from: r.commentReactions.userId, to: r.user.id }),
    comment: r.one.snackComments({ from: r.commentReactions.commentId, to: r.snackComments.id }),
  },

  commentReports: {
    reporter: r.one.user({ from: r.commentReports.reporterId, to: r.user.id }),
    comment: r.one.snackComments({ from: r.commentReports.commentId, to: r.snackComments.id }),
  },

  bookmarks: {
    user: r.one.user({ from: r.bookmarks.userId, to: r.user.id }),
    snackItem: r.one.snackItems({ from: r.bookmarks.snackItemId, to: r.snackItems.id }),
  },
}));
