import {
  deleteAdminCommentProcedure,
  deleteSnackImageProcedure,
  getSnackProcedure,
  listAdminCommentsProcedure,
  listPendingSnacksProcedure,
  reorderSnackImagesProcedure,
  reviewSnackProcedure,
  updateSnackProcedure,
} from "#/features/admin/admin.routes.server";
import {
  getSessionProcedure,
  linkSocialAccountProcedure,
  listAccountsProcedure,
  signInOTPProcedure,
  unlinkAccountProcedure,
  uploadAvatarProcedure,
} from "#/features/auth/auth.routes.server";
import {
  createSnackProcedure,
  getSnackBySlugProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/catalogue.routes.server";
import { getSearchedItemsProcedure } from "#/features/catalogue/search-snacks/search-snacks.routes.server";
import {
  addReplyProcedure,
  editReplyProcedure,
  getRatingsForSnackProcedure,
  listCommentRepliesProcedure,
  listCommentsProcedure,
  rateSnackProcedure,
  reactToCommentProcedure,
  removeRatingProcedure,
  removeReactionProcedure,
  removeReplyProcedure,
} from "#/features/comments/comments.routes.server";

export default {
  snacks: {
    list: listSnacksProcedure,
    create: createSnackProcedure,
    listTypes: listTypesProcedure,
    getBySlug: getSnackBySlugProcedure,
    search: getSearchedItemsProcedure,
  },
  comments: {
    list: listCommentsProcedure,
    rate: rateSnackProcedure,
    addReply: addReplyProcedure,
    editReply: editReplyProcedure,
    removeReply: removeReplyProcedure,
    listReplies: listCommentRepliesProcedure,
    getRatings: getRatingsForSnackProcedure,
    removeRating: removeRatingProcedure,
    react: reactToCommentProcedure,
    removeReaction: removeReactionProcedure,
  },
  admin: {
    listComments: listAdminCommentsProcedure,
    deleteComment: deleteAdminCommentProcedure,
    listPendingSnacks: listPendingSnacksProcedure,
    reviewSnack: reviewSnackProcedure,
    getSnack: getSnackProcedure,
    updateSnack: updateSnackProcedure,
    reorderSnackImages: reorderSnackImagesProcedure,
    deleteSnackImage: deleteSnackImageProcedure,
  },
  auth: {
    getSession: getSessionProcedure,
    signInOTP: signInOTPProcedure,
    linkSocialAccount: linkSocialAccountProcedure,
    unlinkAccount: unlinkAccountProcedure,
    listAccounts: listAccountsProcedure,
    uploadAvatar: uploadAvatarProcedure,
  },
};
