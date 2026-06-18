import { os } from "@orpc/server";
import * as z from "zod";

import { snacksRepository } from "../server/repositories/snacks.repository.instance";
import { listSnacksFeed } from "../server/services/list-snacks.service";

const listSnacksInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const listSnacks = os.input(listSnacksInputSchema).handler(({ input }) => {
  const { limit, cursor } = input;

  return listSnacksFeed({ limit, cursor }, snacksRepository);
});
