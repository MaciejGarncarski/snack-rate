import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import crypto from "node:crypto";

import { serverEnv } from "#/lib/server.env";

// Alphabet without confusing characters (0/O, 1/I/l)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 5;
const COOKIE_NAME = "captcha_token";
const COOKIE_MAX_AGE = 600;

function getSecret(): string {
  return serverEnv.CAPTCHA_SECRET;
}

export function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

export function signCode(code: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export function verifySignature(code: string, signature: string, secret: string): boolean {
  const expected = signCode(code, secret);
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function renderSVG(code: string): string {
  const w = 200;
  const h = 64;
  const spacing = 32;
  const startX = 20;
  const fontSize = 30;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
  <rect width="${w}" height="${h}" fill="#f4f4f4" rx="4"/>`;

  const lineCount = randomInt(3, 6);
  for (let i = 0; i < lineCount; i++) {
    svg += `
  <line x1="${randomInt(0, w)}" y1="${randomInt(0, h)}" x2="${randomInt(0, w)}" y2="${randomInt(0, h)}" stroke="hsl(${randomInt(0, 360)}, 50%, 60%)" stroke-width="1.5" stroke-opacity="0.6"/>`;
  }

  for (let i = 0; i < code.length; i++) {
    const x = startX + i * spacing;
    const y = randomInt(38, 48);
    const angle = randomInt(-20, 20);
    svg += `
  <text x="${x}" y="${y}" transform="rotate(${angle}, ${x}, ${y})" font-family="Nunito Sans Variable, monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="hsl(${randomInt(200, 260)}, 60%, 30%)">${code[i]}</text>`;
  }

  const dotCount = randomInt(20, 50);
  for (let i = 0; i < dotCount; i++) {
    svg += `
  <circle cx="${randomInt(0, w)}" cy="${randomInt(0, h)}" r="${randomInt(1, 2)}" fill="#999" fill-opacity="0.4"/>`;
  }

  svg += "\n</svg>";
  return svg;
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
