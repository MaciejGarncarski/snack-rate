import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";

import { generateCode, renderSVG, signCode } from "#/features/captcha/captcha";
import { serverEnv } from "#/lib/server.env";

const COOKIE_NAME = "captcha_token";
const COOKIE_MAX_AGE = 600;

function getSecret(): string {
  return serverEnv.CAPTCHA_SECRET;
}

export const getCaptcha = createServerFn({ method: "GET" }).handler(() => {
  const code = generateCode();
  const svg = renderSVG(code);
  const signature = signCode(code, getSecret());

  setCookie(COOKIE_NAME, `${code}:${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return svg;
});
