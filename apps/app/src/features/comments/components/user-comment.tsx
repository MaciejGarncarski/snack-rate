import { useSuspenseQuery } from "@tanstack/react-query";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemTitle } from "#/components/ui/item";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query-options";
import { AddCommentForm } from "#/features/comments/components/add-comment-form";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { useCommentSnack } from "#/features/comments/queries/use-comment-snack";
import { Route } from "#/routes/_app/produkt/$slug/route";

export function UserComment() {
  const { slug } = Route.useParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: snack } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));
  const { userRating } = useSuspenseQuery(snackRatingsQueryOptions(snack.id)).data;
  const rateSnack = useCommentSnack();

  if (isFormOpen) {
    return (
      <Item variant="muted">
        <ItemContent>
          <AddCommentForm
            initialRating={userRating?.value ?? null}
            initialBody={userRating?.body ?? null}
            snackItemId={snack.id}
            isPending={rateSnack.isPending}
            onCancel={() => setIsFormOpen(false)}
            onRated={() => setIsFormOpen(false)}
          />
        </ItemContent>
      </Item>
    );
  }

  if (!userRating) {
    return (
      <Item variant="muted">
        <ItemContent className="flex flex-row items-center gap-4 min-h-14">
          <Button type="button" variant="default" size="sm" onClick={() => setIsFormOpen(true)}>
            <div className="relative w-8 h-4">
              <ThumbsDownIcon className="absolute -left-1 top-0.5 size-3" />
              <div className="h-4 w-px rotate-25 bg-primary-foreground absolute left-3 top-0" />
              <ThumbsUpIcon className="absolute left-4 top-0.5 size-3" />
            </div>
            Oceń produkt
          </Button>
          <ItemTitle>Ten produkt jeszcze nie posiada Twojej oceny.</ItemTitle>
        </ItemContent>
      </Item>
    );
  }

  return null;
}
