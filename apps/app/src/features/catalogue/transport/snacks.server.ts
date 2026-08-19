import { ORPCError } from "@orpc/client";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { processUploadedImages } from "#/features/catalogue/processors/snack-image-processor";
import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnackUseCase } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { listSnacksUseCase } from "#/features/catalogue/server/use-cases/list-snacks.use-case";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import { getMainDb } from "#/infrastructure/db/db";
import { baseProcedure } from "#/lib/orpc/procedure";
import { createSnackInputSchema, listSnacksSchema } from "#/schemas/catalogue";

export const listSnacksProcedure = baseProcedure.input(listSnacksSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksUseCase({ limit, cursor }, snacksRepository);
});

export const createSnackProcedure = baseProcedure
  .input(createSnackInputSchema)
  .handler(async ({ input }) => {
    if (!verifyCaptcha(input.captchaCode)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nieprawidłowy kod captcha. Spróbuj odświeżyć obrazek.",
      });
    }

    const slug = Slug.create(input.name);
    const uploadedImages = await processUploadedImages(input.images, slug);

    return createSnackUseCase(input, uploadedImages, slug, snacksRepository, getMainDb());
  });

export const listTypesProcedure = baseProcedure.handler(() => {
  return snacksRepository.listTypes();
});
