import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";

export function ReviewComment({ userName, reviewBody }: { userName: string; reviewBody: string }) {
  return (
    <Item variant="muted" className="ml-4 min-w-0 w-auto py-2">
      <ItemHeader>
        <ItemTitle>{userName}</ItemTitle>
      </ItemHeader>
      <ItemContent>
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground wrap-break-word">{reviewBody}</p>
        </div>
      </ItemContent>
    </Item>
  );
}
