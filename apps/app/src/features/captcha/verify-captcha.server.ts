import { getCookie, deleteCookie } from "@tanstack/react-start/server";

import { verifySignature } from "#/features/captcha/captcha";
import { serverEnv } from "#/lib/server.env";

const COOKIE_NAME = "captcha_token";

function getSecret(): string {
  return serverEnv.CAPTCHA_SECRET;
}

export function verifyCaptcha(userCode: string): boolean {
  const cookie = getCookie(COOKIE_NAME);
  if (!cookie) return false;

  const colonIndex = cookie.indexOf(":");
  if (colonIndex === -1) return false;

  const storedCode = cookie.slice(0, colonIndex);
  const signature = cookie.slice(colonIndex + 1);

  if (!verifySignature(storedCode, signature, getSecret())) {
    return false;
  }

  if (userCode.trim().toLowerCase() !== storedCode.toLowerCase()) {
    return false;
  }

  deleteCookie(COOKIE_NAME, { path: "/" });

  return true;
}
