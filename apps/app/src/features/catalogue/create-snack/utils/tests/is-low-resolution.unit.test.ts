import { describe, expect, it } from "vitest";

import { isLowResolution } from "#/features/catalogue/create-snack/utils/is-low-resolution";

describe("isLowResolution", () => {
  it("returns false for large images", () => {
    expect(isLowResolution(1024, 1280)).toBe(false);
  });

  it("returns true when the shorter side is below the warning threshold", () => {
    expect(isLowResolution(700, 875)).toBe(true);
    expect(isLowResolution(1200, 500)).toBe(true);
  });

  it("returns false for invalid dimensions instead of warning", () => {
    expect(isLowResolution(0, 600)).toBe(false);
  });
});
