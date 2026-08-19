import { z } from "zod";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

const cursorPayloadSchema = z.object({
  timestamp: z.number(),
  id: z.string(),
});

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
    const parsed = cursorPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    return {
      createdAt: new Date(parsed.data.timestamp),
      id: parsed.data.id,
    };
  } catch {
    return null;
  }
}

export type CursorPage<T extends DecodedCursor> = {
  items: T[];
  nextCursor: string | null;
};

export function slicePage<T extends DecodedCursor>(items: T[], limit: number): CursorPage<T> {
  const hasNextPage = items.length > limit;
  const pageItems = hasNextPage ? items.slice(0, limit) : items;

  const lastItem = pageItems.at(-1);
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

  return {
    items: pageItems,
    nextCursor,
  };
}
