import { ORPCError } from "@orpc/client";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnackUseCase } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { listSnacksUseCase } from "#/features/catalogue/server/use-cases/list-snacks.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { baseProcedure } from "#/lib/orpc/procedure";
import { createSnackInputSchema, listSnacksSchema } from "#/schemas/catalogue";

export const listSnacksProcedure = baseProcedure.input(listSnacksSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksUseCase({ limit, cursor }, snacksRepository);
});

const createSnackInput = createSnackInputSchema.transform((data) => {
  return {
    ...data,
    images: data.images.map((image) => {
      // SAFETY: image strings were validated as JSON by createSnackInputSchema.
      return JSON.parse(image) as {
        key: string;
        thumbKey: string;
        filename: string;
        fileExt: string;
      };
    }),
  };
});

export const createSnackProcedure = baseProcedure.input(createSnackInput).handler(({ input }) => {
  if (!verifyCaptcha(input.captchaCode)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nieprawidłowy kod captcha. Spróbuj odświeżyć obrazek.",
    });
  }

  return createSnackUseCase(
    {
      ...input,
      images: input.images,
    },
    snacksRepository,
    getMainDb(),
  );
});

export const listTypesProcedure = baseProcedure.handler(() => {
  return snacksRepository.listTypes();
});
