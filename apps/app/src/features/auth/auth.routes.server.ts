import * as z from "zod";

import { verifyTurnstileToken } from "#/infrastructure/turnstile";
import { baseProcedure } from "#/lib/orpc/procedure";
import { send } from "#/server/lib/queue.server";

export const sendTestEmailProcedure = baseProcedure
  .input(z.object({ email: z.email(), token: z.string() }))
  .handler(async ({ input }) => {
    await verifyTurnstileToken({ token: input.token });
    await send("loginVerification", { mailTo: input.email, code: "RAN-DOM" });
    return { ok: true };
  });
