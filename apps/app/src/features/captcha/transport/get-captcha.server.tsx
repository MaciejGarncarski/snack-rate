import { setCookie } from "@tanstack/react-start/server";

import { COOKIE_MAX_AGE, COOKIE_NAME, generateCode, signCode } from "#/features/captcha/captcha";
import { renderCaptcha } from "#/features/captcha/renderer.tsx";
import { baseProcedure } from "#/lib/orpc/procedure";
import { serverEnv } from "#/lib/server.env";

export const getCaptchaProcedure = baseProcedure.handler(() => {
  const code = generateCode();
  const issuedAt = Math.floor(Date.now() / 1000);
  const signature = signCode(code + ":", serverEnv.CAPTCHA_SECRET, issuedAt);

  setCookie(COOKIE_NAME, `${code}:${issuedAt}:${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return renderCaptcha(code);
});
