export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

export function encodeCursor(createdAt: Date, id: string): string {
  const payload = JSON.stringify({
    timestamp: createdAt.getTime(),
    id,
  });
  return Buffer.from(payload).toString("base64url");
}

export function decodeCursor(cursor: string): DecodedCursor | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);

    if (typeof parsed.timestamp !== "number" || typeof parsed.id !== "string") {
      return null;
    }

    return {
      createdAt: new Date(parsed.timestamp),
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

export function slicePage<T extends DecodedCursor>(
  items: T[],
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const hasNextPage = items.length > limit;
  const pageItems = hasNextPage ? items.slice(0, limit) : items;

  const lastItem = pageItems.at(-1);
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

  return {
    items: pageItems,
    nextCursor,
  };
}
