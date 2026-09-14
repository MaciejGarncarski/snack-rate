import { redactValue, sanitizeRequestData } from "#/observability/request-context";

describe("request-context sanitization", () => {
  it("redacts sensitive keys case-insensitively", () => {
    expect(sanitizeRequestData({ Password: "secret", "api-key": "key", safe: "ok" })).toEqual({
      Password: "[redacted]",
      "api-key": "[redacted]",
      safe: "ok",
    });
  });

  it("truncates strings, arrays, and object keys", () => {
    const result = sanitizeRequestData({
      long: "x".repeat(70),
      values: [1, 2, 3, 4, 5, 6],
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 10,
      k: 11,
    });

    expect(result.long).toBe(`${"x".repeat(64)}...`);
    expect(result.values).toEqual([1, 2, 3, 4, 5]);
    expect(Object.keys(result)).toHaveLength(10);
  });

  it("limits nesting depth and marks unsupported values", () => {
    expect(redactValue({ one: { two: { three: { four: "hidden" } } } })).toEqual({
      one: { two: { three: { four: "[truncated]" } } },
    });
    expect(redactValue(() => "unsupported")).toBe("[unsupported]");
    expect(sanitizeRequestData("token")).toEqual({ value: "token" });
  });
});
