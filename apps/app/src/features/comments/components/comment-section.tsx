import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ItemGroup, ItemSeparator } from "#/components/ui/item";
import { CommentItem } from "#/features/comments/components/comment-item";
import { UserComment } from "#/features/comments/components/user-comment";
import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";

type Props = {
  snackItemId: string;
  ratingsCount?: number | null;
};

export function CommentSection({ snackItemId, ratingsCount }: Props) {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    snackCommentsQueryOptions(snackItemId),
  );

  const { ref } = useInView({
    rootMargin: "400px",
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const comments = data.pages.flatMap((page) => page.items);

  return (
    <Card className="[--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle>
          Sprawdź oceny tego produktu{" "}
          <span className="text-muted-foreground">({ratingsCount ?? 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-w-3xl w-full">
        <ItemGroup>
          <UserComment />
          <ItemSeparator />
          {comments.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Ten produkt nie ma jeszcze recenzji. Bądź pierwszą osobą, która go oceni!
            </p>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </ItemGroup>
        <div ref={ref} />
      </CardContent>
    </Card>
  );
}
