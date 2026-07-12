import { os } from "@orpc/server";
import * as z from "zod";

import { MAXIMUM_IMAGES } from "#/const/image-const";
import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnack } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { listSnacksFeed } from "#/features/catalogue/server/use-cases/list-snacks.use-case";

const listSnacksInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const listSnacksProcedure = os.input(listSnacksInputSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksFeed({ limit, cursor }, snacksRepository);
});

const createSnackInput = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    price: z.number().positive().optional(),
    barcode: z.string().optional(),
    typeSlug: z.string(),
    images: z.array(z.string()).min(1).max(MAXIMUM_IMAGES),
  })
  .transform((data) => {
    return {
      ...data,
      images: data.images.map((image) => {
        return JSON.parse(image) as {
          key: string;
          thumbKey: string;
          filename: string;
          fileExt: string;
        };
      }),
    };
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

export const listTypesProcedure = os.handler(() => {
  return snacksRepository.listTypes();
});
