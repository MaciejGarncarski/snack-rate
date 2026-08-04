import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";

export function CommentReply({
  userName,
  body,
  createdAt,
}: {
  userName: string;
  body: string | null;
  createdAt: Date;
}) {
  const instant = Temporal.Instant.from(createdAt.toISOString());

  return (
    <Item variant="muted" className="ml-4 min-w-0 w-auto py-2">
      <ItemHeader>
        <ItemTitle>
          <span>{userName}</span>
          <span className="text-muted-foreground"> - {instant.toLocaleString("pl-PL")}</span>
        </ItemTitle>
      </ItemHeader>
      <ItemContent>
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground wrap-break-word">
            {body ?? "Brak treści komentarza."}
          </p>
        </div>
      </ItemContent>
    </Item>
  );
}
