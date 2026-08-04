import { describe, expect, it } from "vitest";

import { generateCode, signCode, verifySignature } from "#/features/captcha/captcha";

const SECRET = "test-secret-that-is-at-least-32-chars-long!!";

const issuedAt = Math.floor(Date.now() / 1000);

describe("signCode / verifySignature", () => {
  it("signs and verifies a code correctly", () => {
    const code = "ABC23";
    const sig = signCode(code, SECRET, issuedAt);
    expect(verifySignature(code, sig, SECRET, issuedAt)).toBe(true);
  });

  it("rejects when code is modified (tampered cookie)", () => {
    const code = "ABC23";
    const sig = signCode(code, SECRET, issuedAt);
    const tamperedCode = "XYZ99";
    expect(verifySignature(tamperedCode, sig, SECRET, issuedAt)).toBe(false);
  });

  it("rejects when signature is modified", () => {
    const code = "ABC23";
    const sig = signCode(code, SECRET, issuedAt);
    const lastChar = sig.slice(-1);
    const replacement = lastChar === "0" ? "1" : "0";
    const tamperedSig = sig.slice(0, -1) + replacement;
    expect(verifySignature(code, tamperedSig, SECRET, issuedAt)).toBe(false);
  });

  it("rejects when a different secret is used", () => {
    const code = "ABC23";
    const sig = signCode(code, SECRET, issuedAt);
    expect(verifySignature(code, sig, "different-secret-that-is-also-32-chars!!", issuedAt)).toBe(
      false,
    );
  });

  it("rejects an expired signature", () => {
    const code = "ABC23";
    const expiredAt = issuedAt - 601;
    const sig = signCode(code, SECRET, expiredAt);
    expect(verifySignature(code, sig, SECRET, expiredAt)).toBe(false);
  });

  it("rejects a signature issued in the future", () => {
    const code = "ABC23";
    const futureAt = issuedAt + 10;
    const sig = signCode(code, SECRET, futureAt);
    expect(verifySignature(code, sig, SECRET, futureAt)).toBe(false);
  });
});

describe("generateCode", () => {
  it("returns a 5-character string", () => {
    const code = generateCode();
    expect(code).toHaveLength(5);
  });

  it("uses only characters from the safe alphabet (no 0/O/1/I/l)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateCode();
      expect(code).toMatch(/^[A-HJ-NP-Za-hj-np-z2-9]{5}$/u);
    }
  });
});
