import {
  createSnackProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/transport/snacks.server";
import { listReviewsProcedure } from "#/features/ratings/transport/reviews.server";

export default {
  snacks: {
    list: listSnacksProcedure,
    create: createSnackProcedure,
    listTypes: listTypesProcedure,
  },
  reviews: {
    list: listReviewsProcedure,
  },
};
