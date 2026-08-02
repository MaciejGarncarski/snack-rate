import crypto from "node:crypto";

export const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
export const CODE_LENGTH = 5;
export const COOKIE_NAME = "captcha_token";
export const COOKIE_MAX_AGE = 600;

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

export function signCode(code: string, secret: string, issuedAt: number): string {
  const payload = `${code}.${issuedAt}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(
  code: string,
  signature: string,
  secret: string,
  issuedAt: number,
  maxAgeSeconds: number = COOKIE_MAX_AGE,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (now - issuedAt > maxAgeSeconds || issuedAt > now) {
    return false;
  }

  const expected = signCode(code, secret, issuedAt);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
