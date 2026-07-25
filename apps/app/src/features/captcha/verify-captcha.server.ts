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

  const parts = cookie.split(":");

  const [storedCode, signature] = parts;

  if (!storedCode || !signature) {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return false;
  }

  if (!verifySignature(storedCode + ":", signature, getSecret())) {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return false;
  }

  if (userCode.trim().toLowerCase() !== storedCode.toLowerCase()) {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return false;
  }

  deleteCookie(COOKIE_NAME, { path: "/" });

  return true;
}
