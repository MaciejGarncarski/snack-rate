import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnack } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { listSnacksFeed } from "#/features/catalogue/server/use-cases/list-snacks.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { createSnackInputSchema, listSnacksSchema } from "#/schemas/catalogue";

export const listSnacksProcedure = os.input(listSnacksSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksFeed({ limit, cursor }, snacksRepository);
});

const createSnackInput = createSnackInputSchema.transform((data) => {
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
  if (!verifyCaptcha(input.captchaCode)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nieprawidłowy kod captcha. Spróbuj odświeżyć obrazek.",
    });
  }

  return createSnack(
    {
      ...input,
      images: input.images,
    },
    snacksRepository,
    getMainDb(),
  );
});

export const listTypesProcedure = os.handler(() => {
  return snacksRepository.listTypes();
});
