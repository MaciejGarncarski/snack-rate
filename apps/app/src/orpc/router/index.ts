import {
  createSnackProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/transport/snacks.server";
import { listCommentsProcedure } from "#/features/comments/transport/comments.server";

export default {
  snacks: {
    list: listSnacksProcedure,
    create: createSnackProcedure,
    listTypes: listTypesProcedure,
  },
  comments: {
    list: listCommentsProcedure,
  },
};
