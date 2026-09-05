import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
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
      <CardContent className=" w-full">
        <ItemGroup>
          <UserComment />
          <ItemSeparator />
          {comments.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <StarIcon />
                </EmptyMedia>
                <EmptyTitle>Bądź pierwszy</EmptyTitle>
                <EmptyDescription>Twoja opinia pomoże innym!</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </ItemGroup>
        <div ref={ref} />
      </CardContent>
    </Card>
  );
}
