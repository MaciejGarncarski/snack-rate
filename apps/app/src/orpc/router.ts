import {
  deleteAdminCommentProcedure,
  listAdminCommentsProcedure,
  listPendingSnacksProcedure,
  reviewSnackProcedure,
} from "#/features/admin/admin.routes.server";
import {
  getSessionProcedure,
  linkSocialAccountProcedure,
  listAccountsProcedure,
  signInOTPProcedure,
  unlinkAccountProcedure,
} from "#/features/auth/auth.routes.server";
import {
  createSnackProcedure,
  getSnackBySlugProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/catalogue.routes.server";
import { getSearchedItemsProcedure } from "#/features/catalogue/search-snacks/search-snacks.routes.server";
import {
  getRatingsForSnackProcedure,
  listCommentsProcedure,
  rateSnackProcedure,
  reactToCommentProcedure,
  removeRatingProcedure,
  removeReactionProcedure,
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
  },
  auth: {
    getSession: getSessionProcedure,
    signInOTP: signInOTPProcedure,
    linkSocialAccount: linkSocialAccountProcedure,
    unlinkAccount: unlinkAccountProcedure,
    listAccounts: listAccountsProcedure,
  },
};
