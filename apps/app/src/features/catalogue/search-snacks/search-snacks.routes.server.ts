import { ratelimit } from "@orpc/ratelimit";
import { MemoryRateLimiter } from "@orpc/ratelimit/memory";
import ms from "ms";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { searchSnacksUseCase } from "#/features/catalogue/server/use-cases/search-snacks.use-case";
import { baseProcedure } from "#/lib/orpc/procedure";
import { searchSchema } from "#/schemas/search";

const searchRateLimiter = new MemoryRateLimiter({
  maxRequests: 60,
  window: ms("1m"),
});

export const getSearchedItemsProcedure = baseProcedure
  .input(searchSchema)
  .use(
    ratelimit({
      limiter: () => searchRateLimiter,
      key: ({ context }) => `snacks.search:${context.userId ?? context.guestId ?? "anon"}`,
    }),
  )
  .handler(({ input }) => searchSnacksUseCase(input.query, snacksRepository));
