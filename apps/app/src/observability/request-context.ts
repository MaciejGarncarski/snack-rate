const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "secret",
  "secretkey",
  "secret_key",
  "token",
  "authorization",
  "cookie",
  "set-cookie",
  "api_key",
  "apikey",
  "api-key",
  "session",
  "sessionid",
  "session_id",
  "csrf",
  "x-csrf-token",
  "x-api-key",
  "captcha",
  "captchacode",
  "captcha_code",
  "body",
  "comment",
  "message",
  "email",
  "phone",
  "firstname",
  "lastname",
  "address",
]);

const MAX_STRING_LENGTH = 64;
const MAX_ARRAY_LENGTH = 5;
const MAX_OBJECT_KEYS = 10;
const MAX_DEPTH = 3;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactKey(key: string): boolean {
  const normalized = key.toLowerCase().replaceAll(/[\s-]/gu, "_");
  return SENSITIVE_KEYS.has(normalized);
}

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return "[truncated]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return truncateString(value);
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return value;
  }
  if (Array.isArray(value)) {
    const trimmed = value.slice(0, MAX_ARRAY_LENGTH);
    return trimmed.map((item) => sanitizeValue(item, depth + 1));
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).slice(0, MAX_OBJECT_KEYS);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      if (redactKey(key)) {
        out[key] = "[redacted]";
      } else {
        out[key] = sanitizeValue(value[key], depth + 1);
      }
    }
    return out;
  }
  return "[unsupported]";
}

export function sanitizeRequestData(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) return { value: sanitizeValue(value, 0) };
  return sanitizeValue(value, 0) as Record<string, unknown>;
}

export function redactValue(value: unknown): unknown {
  return sanitizeValue(value, 0);
}
