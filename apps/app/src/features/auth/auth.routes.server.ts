import { ORPCError } from "@orpc/client";
import { ratelimit } from "@orpc/ratelimit";
import { MemoryRateLimiter } from "@orpc/ratelimit/memory";
import ms from "ms";
import * as z from "zod";

import { verifyTurnstileToken } from "#/infrastructure/turnstile";
import { auth } from "#/lib/auth.ts";
import { baseProcedure } from "#/lib/orpc/procedure";

const signInOTPRateLimiter = new MemoryRateLimiter({
  maxRequests: 10,
  window: ms("1h"),
});

function authRateKeyPrefix(input: { email: string }): string {
  return input.email.trim().toLowerCase();
}

export const signInOTPProcedure = baseProcedure
  .input(z.object({ email: z.email(), token: z.string() }))
  .use(
    ratelimit({
      limiter: () => signInOTPRateLimiter,
      key: (_options, input) => `auth.signInOTP:${authRateKeyPrefix(input)}`,
    }),
  )
  .handler(async ({ input }) => {
    const isVerified = await verifyTurnstileToken({ token: input.token });

    if (!isVerified) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nie udało się zweryfikować użytkownika",
        cause: "Turnstile token verification failed",
      });
    }

    await auth.api.sendVerificationOTP({
      body: {
        email: input.email,
        type: "sign-in",
      },
    });
  });

export const getSessionProcedure = baseProcedure.handler(async ({ context }) => {
  const session = await auth.api.getSession({ headers: context.requestHeaders });

  if (!session?.user) {
    return { user: null };
  }

  const { id, email, name, image, role } = session.user as typeof session.user & {
    role?: string;
  };
  return { user: { id, email, name, image, role: role ?? "user" } };
});

export const listAccountsProcedure = baseProcedure.handler(async ({ context }) => {
  const session = await auth.api.getSession({ headers: context.requestHeaders });

  if (!session?.user) {
    return { accounts: [] };
  }

  const accounts = await auth.api.listUserAccounts({
    headers: context.requestHeaders,
  });

  return { accounts };
});

const linkableProviderSchema = z.enum(["discord", "google"]);

function getAuthErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  const candidate = error as {
    body?: { code?: unknown };
    code?: unknown;
    cause?: unknown;
  };
  if (typeof candidate.body?.code === "string") {
    return candidate.body.code;
  }
  if (typeof candidate.code === "string") {
    return candidate.code;
  }
  if (candidate.cause !== undefined) {
    return getAuthErrorCode(candidate.cause);
  }
  return null;
}

export const linkSocialAccountProcedure = baseProcedure
  .input(
    z.object({
      provider: linkableProviderSchema,
      callbackURL: z.string().default("/auth/konto"),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.userId === null) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Musisz być zalogowany, aby połączyć konto.",
      });
    }

    if (input.provider !== "discord") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Połączenie konta Google będzie dostępne wkrótce.",
      });
    }

    try {
      const result = await auth.api.linkSocialAccount({
        headers: context.requestHeaders,
        body: {
          provider: input.provider,
          callbackURL: input.callbackURL,
          errorCallbackURL: input.callbackURL,
        },
      });

      return { url: result.url, redirect: result.redirect };
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code === "SOCIAL_ACCOUNT_ALREADY_LINKED") {
        throw new ORPCError("CONFLICT", {
          message: "To konto Discord jest już połączone.",
        });
      }

      if (code === "PROVIDER_NOT_FOUND") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Ten dostawca logowania nie jest dostępny.",
        });
      }

      throw new ORPCError("BAD_REQUEST", {
        message: "Nie udało się rozpocząć łączenia konta Discord. Spróbuj ponownie.",
      });
    }
  });

export const unlinkAccountProcedure = baseProcedure
  .input(z.object({ accountId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    if (context.userId === null) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Musisz być zalogowany, aby odłączyć konto.",
      });
    }

    try {
      await auth.api.unlinkAccount({
        headers: context.requestHeaders,
        body: { accountId: input.accountId },
      });

      return { status: true };
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code === "FAILED_TO_UNLINK_LAST_ACCOUNT") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Nie możesz odłączyć ostatniego sposobu logowania.",
        });
      }

      if (code === "ACCOUNT_NOT_FOUND") {
        throw new ORPCError("NOT_FOUND", {
          message: "To konto nie jest już połączone.",
        });
      }

      throw new ORPCError("BAD_REQUEST", {
        message: "Nie udało się odłączyć konta. Spróbuj ponownie.",
      });
    }
  });
