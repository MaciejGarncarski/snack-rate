import { describe, expect, it, vi } from "vitest";

vi.mock("#/orpc/client", () => ({
  orpc: {
    snacks: {
      list: {
        infiniteOptions: (opts: { input: (p: string | null) => unknown }) => ({
          queryKey: ["snacks", "list", opts.input(null)],
          ...opts,
        }),
      },
    },
  },
}));

import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query-options";

describe("listSnacksQueryOptions", () => {
  it("creates different keys for different typeSlug", () => {
    const a = listSnacksQueryOptions({ typeSlug: "chipsy" });
    const b = listSnacksQueryOptions({ typeSlug: "czekolada" });
    const c = listSnacksQueryOptions();
    expect(a.queryKey).not.toEqual(b.queryKey);
    expect(a.queryKey).not.toEqual(c.queryKey);
  });

  it("includes typeSlug in input", () => {
    const opts = listSnacksQueryOptions({ typeSlug: "chipsy" });
    const input = (opts as unknown as { input: (p: string | null) => unknown }).input?.(null);
    expect(input).toMatchObject({ typeSlug: "chipsy" });
  });

  it("returns undefined typeSlug when not filtered", () => {
    const opts = listSnacksQueryOptions();
    const input = (opts as unknown as { input: (p: string | null) => unknown }).input?.(null);
    expect((input as Record<string, unknown>).typeSlug).toBeUndefined();
  });
});
