import {
  createSnackProcedure,
  listSnacksProcedure,
  listTypesProcedure,
} from "@/features/catalogue/api/snacks.server";

export default {
  snacks: {
    list: listSnacksProcedure,
    create: createSnackProcedure,
    listTypes: listTypesProcedure,
  },
};
