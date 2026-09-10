import { ORPCError } from "@orpc/client";

import { processUploadedImages } from "#/features/catalogue/processors/snack-image-processor";
import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { createSnackUseCase } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { getSnackBySlugUseCase } from "#/features/catalogue/server/use-cases/get-snack-by-slug.use-case";
import { listSnacksUseCase } from "#/features/catalogue/server/use-cases/list-snacks.use-case";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import { getMainDb } from "#/infrastructure/db/db";
import { verifyTurnstileToken } from "#/infrastructure/turnstile";
import { baseProcedure } from "#/lib/orpc/procedure";
import { createSnackInputSchema, listSnacksSchema, snackSlugSchema } from "#/schemas/catalogue";

export const listSnacksProcedure = baseProcedure.input(listSnacksSchema).handler(({ input }) => {
  const { limit, cursor, typeSlug, sortBy } = input;

  return listSnacksUseCase({ limit, cursor, typeSlug, sortBy }, snacksRepository);
});

export const createSnackProcedure = baseProcedure
  .input(createSnackInputSchema)
  .handler(async ({ input, context }) => {
    const remoteIp =
      context.requestHeaders.get("x-forwarded-for") ?? context.requestHeaders.get("x-real-ip");

    const isVerified = await verifyTurnstileToken({
      token: input.token ?? "",
      remoteIp: remoteIp ?? undefined,
    });

    if (!isVerified) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nie udało się zweryfikować użytkownika",
        cause: "Turnstile token verification failed",
      });
    }

    const slug = Slug.create(input.name);
    const uploadedImages = await processUploadedImages(input.images, slug);

    return createSnackUseCase(input, uploadedImages, slug, snacksRepository, getMainDb());
  });

export const listTypesProcedure = baseProcedure.handler(() => {
  return snacksRepository.listTypes();
});

export const getSnackBySlugProcedure = baseProcedure.input(snackSlugSchema).handler(({ input }) => {
  return getSnackBySlugUseCase(input.slug, snacksRepository);
});
