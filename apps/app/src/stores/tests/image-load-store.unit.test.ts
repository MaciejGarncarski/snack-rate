// The store keeps its sources in module state, so every test imports a fresh copy.
function importFreshStore() {
  vi.resetModules();

  return import("#/stores/image-load-store");
}

describe("image load store", () => {
  it("should not report an unknown source as loaded", async () => {
    const { hasImageLoaded } = await importFreshStore();

    expect(hasImageLoaded("https://cdn.test/a.webp")).toBe(false);
  });

  it("should report a marked source as loaded", async () => {
    const { hasImageLoaded, markImageLoaded } = await importFreshStore();

    markImageLoaded("https://cdn.test/a.webp");

    expect(hasImageLoaded("https://cdn.test/a.webp")).toBe(true);
    expect(hasImageLoaded("https://cdn.test/b.webp")).toBe(false);
  });

  it("should keep marking the same source as a single entry", async () => {
    const { hasImageLoaded, markImageLoaded } = await importFreshStore();

    markImageLoaded("https://cdn.test/a.webp");
    markImageLoaded("https://cdn.test/a.webp");

    expect(hasImageLoaded("https://cdn.test/a.webp")).toBe(true);
  });

  it("should evict the oldest sources once the limit is reached", async () => {
    const { hasImageLoaded, markImageLoaded } = await importFreshStore();

    for (let index = 0; index < 300; index += 1) {
      markImageLoaded(`https://cdn.test/${index}.webp`);
    }

    markImageLoaded("https://cdn.test/300.webp");

    expect(hasImageLoaded("https://cdn.test/0.webp")).toBe(false);
    expect(hasImageLoaded("https://cdn.test/1.webp")).toBe(true);
    expect(hasImageLoaded("https://cdn.test/300.webp")).toBe(true);
  });
});
