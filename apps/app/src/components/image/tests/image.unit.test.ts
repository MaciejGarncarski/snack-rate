import { cleanup, render } from "@testing-library/react";
// @vitest-environment jsdom
import { act, createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Image } from "#/components/image/image";

function getImg(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector<HTMLImageElement>("img:not([aria-hidden])");

  if (!img) {
    throw new Error("image not rendered");
  }

  return img;
}

function hasSkeleton(container: HTMLElement): boolean {
  return container.querySelector(".animate-pulse") !== null;
}

function fireLoad(container: HTMLElement): void {
  const img = getImg(container);
  vi.spyOn(img, "naturalWidth", "get").mockReturnValue(100);

  act(() => {
    img.dispatchEvent(new Event("load"));
  });
}

function mockAlreadyLoaded(): void {
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(100);
}

// The unit project only collects `*.unit.test.ts`, hence `createElement` over JSX.
describe("Image", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should show the skeleton and fade the image in once it loads", () => {
    const { container } = render(createElement(Image, { src: "first.webp", alt: "" }));

    expect(hasSkeleton(container)).toBe(true);
    expect(getImg(container).className).toContain("opacity-0");

    fireLoad(container);

    expect(hasSkeleton(container)).toBe(false);
    expect(getImg(container).className).toContain("opacity-100");
  });

  it("should render an already available image without the skeleton", () => {
    mockAlreadyLoaded();

    const { container } = render(createElement(Image, { src: "second.webp", alt: "" }));

    expect(hasSkeleton(container)).toBe(false);
    expect(getImg(container).className).toContain("opacity-100");
  });

  it("should not animate an image that already loaded in this session", () => {
    const first = render(createElement(Image, { src: "third.webp", alt: "" }));
    fireLoad(first.container);
    first.unmount();

    const { container } = render(createElement(Image, { src: "third.webp", alt: "" }));

    expect(hasSkeleton(container)).toBe(false);
    expect(getImg(container).className).toContain("opacity-100");
  });

  it("should resolve the status again when src changes", () => {
    const { container, rerender } = render(createElement(Image, { src: "fourth.webp", alt: "" }));
    fireLoad(container);

    rerender(createElement(Image, { src: "fifth.webp", alt: "" }));

    expect(hasSkeleton(container)).toBe(true);
    expect(getImg(container).className).toContain("opacity-0");
  });

  it("should swap a cached src for a loaded image without animating", () => {
    const { container, rerender } = render(createElement(Image, { src: "sixth.webp", alt: "" }));
    fireLoad(container);

    rerender(createElement(Image, { src: "seventh.webp", alt: "" }));
    fireLoad(container);
    rerender(createElement(Image, { src: "sixth.webp", alt: "" }));

    expect(hasSkeleton(container)).toBe(false);
    expect(getImg(container).className).toContain("opacity-100");
  });

  it("should render the error component when the image fails", () => {
    const { container } = render(createElement(Image, { src: "eighth.webp", alt: "" }));

    act(() => {
      getImg(container).dispatchEvent(new Event("error"));
    });

    expect(hasSkeleton(container)).toBe(false);
    expect(container.querySelector("img")).toBeNull();
  });
});
