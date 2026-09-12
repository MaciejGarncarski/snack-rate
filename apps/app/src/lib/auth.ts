import * as schema from "@snack-rate/db-schema/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getMainDb } from "#/infrastructure/db/db.ts";
import { serverEnv } from "#/lib/server.env.ts";
import { send } from "#/server/lib/queue.server";

export const auth = betterAuth({
  advanced: {
    cookiePrefix: "snack-rate",
    cookies: {
      session_token: {
        name: "session_token",
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  database: drizzleAdapter(getMainDb(), { provider: "pg", schema: schema }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: serverEnv.DISCORD_CLIENT_ID,
      clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
    },
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseUrl: serverEnv.BETTER_AUTH_URL,
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await send("loginVerification", { mailTo: email, code: otp });
        }
      },
    }),
    tanstackStartCookies(),
  ],
});
