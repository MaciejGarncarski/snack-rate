import {
  checkAdminAuthProcedure,
  deleteAdminCommentProcedure,
  listAdminCommentsProcedure,
  logoutAdminProcedure,
  verifyAdminPasswordProcedure,
} from "#/features/admin/admin.routes.server";
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
  removeRatingProcedure,
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
  },
  admin: {
    verifyPassword: verifyAdminPasswordProcedure,
    checkAuth: checkAdminAuthProcedure,
    logout: logoutAdminProcedure,
    listComments: listAdminCommentsProcedure,
    deleteComment: deleteAdminCommentProcedure,
  },
};
