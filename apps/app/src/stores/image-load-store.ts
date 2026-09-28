const MAX_SIZE = 300;

const loadedSources = new Set<string>();

export function hasImageLoaded(src: string): boolean {
  return loadedSources.has(src);
}

export function markImageLoaded(src: string): void {
  loadedSources.add(src);

  while (loadedSources.size > MAX_SIZE) {
    const oldest = loadedSources.values().next().value;

    if (oldest === undefined) {
      break;
    }

    loadedSources.delete(oldest);
  }
}
