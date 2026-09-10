import { exponentialBackoff } from "#/lib/exponential-backoff";
import { serverEnv } from "#/lib/server.env";
import { logger } from "#/observability/logger/logger";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
  metadata?: { ephemeral_id?: string };
};

type VerifyTurnstileTokenOptions = {
  token: string;
  remoteIp?: string;
  retries?: number;
};

export class TurnstileVerificationError extends Error {
  constructor(
    message: string,
    public readonly errorCodes: string[] = [],
  ) {
    super(message);
    this.name = "TurnstileVerificationError";
  }
}

export async function verifyTurnstileToken({
  token,
  remoteIp,
  retries = 3,
}: VerifyTurnstileTokenOptions): Promise<boolean> {
  if (!token) {
    return false;
  }

  const doVerify = async () => {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: serverEnv.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIp,
      }),
    });

    if (!res.ok) {
      throw new Error(`Turnstile siteverify request failed with status ${res.status}`);
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    return data.success;
  };

  const result = await exponentialBackoff(doVerify, {
    retries,
    minTimeout: 200,
    factor: 2,
    maxTimeout: 2000,
    fnName: "verifyTurnstileToken",
    logger: logger,
  });

  return result;
}
