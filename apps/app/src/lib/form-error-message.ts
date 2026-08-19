function isString(cause: unknown): cause is string {
  return typeof cause === "string";
}

function isObjectWithMessage(cause: unknown): cause is { message: unknown } {
  return typeof cause === "object" && cause !== null && "message" in cause;
}

export function extractFormError(errors: readonly unknown[]) {
  const error = errors[0];

  if (isString(error)) {
    return error;
  }

  if (isObjectWithMessage(error)) {
    return String(error.message);
  }
}
