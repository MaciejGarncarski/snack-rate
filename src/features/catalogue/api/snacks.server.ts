import { os } from "@orpc/server";
import * as z from "zod";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnack } from "#/features/catalogue/server/services/create-snack.service";
import { listSnacksFeed } from "#/features/catalogue/server/services/list-snacks.service";

const listSnacksInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const listSnacks = os.input(listSnacksInputSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksFeed({ limit, cursor }, snacksRepository);
});

const createSnackInput = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  barcode: z.string().optional(),
  brandId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  images: z.array(z.file()).min(1).max(5),
});

export const createSnackProcedure = os.input(createSnackInput).handler(({ input }) => {
  return createSnack(
    {
      ...input,
      images: input.images,
    },
    snacksRepository,
  );
});

export const listBrands = os.handler(async () => {
  return snacksRepository.listBrands();
});

export const listTypes = os.handler(async () => {
  return snacksRepository.listTypes();
});
