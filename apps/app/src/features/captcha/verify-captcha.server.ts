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

  const [storedCode, issuedAt, signature] = cookie.split(":");

  if (!storedCode || !issuedAt || !signature) {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return false;
  }

  const issuedAtNum = Number(issuedAt);
  if (!Number.isFinite(issuedAtNum)) {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return false;
  }

  if (!verifySignature(storedCode + ":", signature, getSecret(), issuedAtNum)) {
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
