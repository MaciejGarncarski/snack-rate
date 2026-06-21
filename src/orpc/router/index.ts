import {
  createSnackProcedure,
  listBrands,
  listSnacks,
  listTypes,
} from "#/features/catalogue/api/snacks.server";

export default {
  listSnacks,
  createSnack: createSnackProcedure,
  listBrands,
  listTypes,
};
