import { os } from "@orpc/server";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { getSnackBySlugUseCase } from "#/features/snacks/server/use-cases/get-snack-by-slug.use-case";
import { listSnacksFeedUseCase } from "#/features/snacks/server/use-cases/list-snacks-feed.use-case";

const listSnacksInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const listSnacks = os.input(listSnacksInputSchema).handler(({ input }) => {
  const { limit, cursor } = input;
  return listSnacksFeedUseCase({ limit, cursor });
});

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlug = createServerFn({ method: "GET" })
  .inputValidator(snackSlugSchema)
  .handler(({ data }) => getSnackBySlugUseCase(data.slug));
