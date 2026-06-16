import { os } from "@orpc/server";
import * as z from "zod";

import { listSnacksFeedUseCase } from "#/features/snacks/server/use-cases/list-snacks-feed.use-case";

const listSnacksInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const listSnacks = os.input(listSnacksInputSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksFeedUseCase({ limit, cursor });
});
