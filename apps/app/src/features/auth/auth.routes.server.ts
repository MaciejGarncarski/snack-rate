import * as z from "zod";

import { verifyTurnstileToken } from "#/infrastructure/turnstile";
import { auth } from "#/lib/auth.ts";
import { baseProcedure } from "#/lib/orpc/procedure";
import { logger } from "#/observability/logger/logger.ts";

export const signInOTPProcedure = baseProcedure
  .input(z.object({ email: z.email(), token: z.string() }))
  .handler(async ({ input }) => {
    await verifyTurnstileToken({ token: input.token });
    await auth.api.sendVerificationOTP({
      body: {
        email: input.email,
        type: "sign-in",
      },
    });
  });

export const verifyOTPProcedure = baseProcedure
  .input(z.object({ email: z.email(), otp: z.string() }))
  .handler(async ({ input }) => {
    const result = await auth.api.signInEmailOTP({
      body: {
        email: input.email,
        otp: input.otp,
      },
    });

    logger.info({
      email: input.email,
      otp: input.otp,
      result,
    });
  });

export const getSessionProcedure = baseProcedure.handler(async ({ context }) => {
  const session = await auth.api.getSession({ headers: context.requestHeaders });

  if (!session?.user) {
    return { user: null };
  }

  const { id, email, name, image } = session.user;
  return { user: { id, email, name, image } };
});
