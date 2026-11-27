const MAX_SIZE = 300;

const loadedSources = new Set<string>();

export function hasImageLoaded(src: string): boolean {
  return loadedSources.has(src);
}

export function markImageLoaded(src: string): void {
  loadedSources.add(src);

  const overflow = loadedSources.size - MAX_SIZE;
  if (overflow > 0) {
    [...loadedSources].slice(0, overflow).map((oldestSource) => loadedSources.delete(oldestSource));
  }
}
