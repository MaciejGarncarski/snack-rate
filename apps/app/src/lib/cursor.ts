import { z } from "zod";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
  aggregateValue?: number;
};

const cursorPayloadSchema = z.object({
  timestamp: z.number(),
  id: z.string(),
  av: z.number().optional(),
});

export function encodeCursor(createdAt: Date, id: string, aggregateValue?: number): string {
  const payload: { timestamp: number; id: string; av?: number } = {
    timestamp: createdAt.getTime(),
    id,
  };
  if (aggregateValue !== undefined) {
    payload.av = aggregateValue;
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string): DecodedCursor | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = cursorPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    return {
      createdAt: new Date(parsed.data.timestamp),
      id: parsed.data.id,
      aggregateValue: parsed.data.av,
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
  const nextCursor =
    hasNextPage && lastItem
      ? encodeCursor(lastItem.createdAt, lastItem.id, lastItem.aggregateValue)
      : null;

  return {
    items: pageItems,
    nextCursor,
  };
}
