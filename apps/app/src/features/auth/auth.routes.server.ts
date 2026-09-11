import * as z from "zod";

import { baseProcedure } from "#/lib/orpc/procedure";
import { send } from "#/server/lib/queue.server";

// TEST ONLY: enqueues a login verification email job for manual queue testing.
export const sendTestEmailProcedure = baseProcedure
  .input(z.object({ email: z.email() }))
  .handler(async ({ input }) => {
    const jobId = await send("loginVerification", { key: input.email });
    return { ok: true, jobId };
  });
