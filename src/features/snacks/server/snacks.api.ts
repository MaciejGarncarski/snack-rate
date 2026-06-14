import { os } from "@orpc/server";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { SnackMapper } from "#/features/snacks/server/snack-item.mapper";
import { snacksRepository } from "#/features/snacks/server/snacks.repository";

export const listSnacks = os
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { limit, cursor } = input;

    const searched = await snacksRepository.list(limit, cursor);
    const hasNextPage = searched.length > limit;
    const items = hasNextPage ? searched.slice(0, limit) : searched;
    const nextCursor = hasNextPage ? items.at(-1)?.id || null : null;

    const snacks = await SnackMapper.toDomain(searched);

    return {
      items: snacks.map((snack) => SnackMapper.toDTO(snack)),
      nextCursor,
    };
  });

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlug = createServerFn()
  .inputValidator(snackSlugSchema)
  .handler(async ({ data }) => {
    const snack = await snacksRepository.getBySlug(data.slug);
    return snack;
  });
