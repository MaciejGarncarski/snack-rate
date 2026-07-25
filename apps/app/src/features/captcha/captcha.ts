import crypto from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 5;
const COOKIE_NAME = "captcha_token";
const COOKIE_MAX_AGE = 600;

export function generateCode(): string {
  const maxValid = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  let code = "";
  while (code.length < CODE_LENGTH) {
    const bytes = crypto.randomBytes(CODE_LENGTH - code.length);
    for (const byte of bytes) {
      if (byte < maxValid) {
        code += ALPHABET[byte % ALPHABET.length];
        if (code.length === CODE_LENGTH) break;
      }
    }
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

export { ALPHABET, CODE_LENGTH, COOKIE_NAME, COOKIE_MAX_AGE };
