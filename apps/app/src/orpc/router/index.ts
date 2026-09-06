import { getSearchedItemsProcedure } from "#/features/catalogue/search-snacks/transport/get-searched-items";
import { getSnackBySlugProcedure } from "#/features/catalogue/transport/get-snack-by-slug.server";
import {
  createSnackProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/transport/snacks.server";
import { listCommentsProcedure } from "#/features/comments/transport/comments.server";
import {
  getRatingsForSnackProcedure,
  rateSnackProcedure,
  removeRatingProcedure,
} from "#/features/comments/transport/rate-snack.server";

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
};
