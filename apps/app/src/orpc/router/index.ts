import {
  createSnackProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "#/features/catalogue/transport/snacks.server";

export default {
  snacks: {
    list: listSnacksProcedure,
    create: createSnackProcedure,
    listTypes: listTypesProcedure,
  },
};
