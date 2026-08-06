import { useSuspenseQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query-options";
import { UserCommentForm } from "#/features/comments/components/user-comment-form";
import { UserCommentItem } from "#/features/comments/components/user-comment-item";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { useCommentSnack } from "#/features/comments/queries/use-comment-snack";
import { useRemoveComment } from "#/features/comments/queries/use-remove-comment";
import { Route } from "#/routes/_app/produkt/$slug/route";

export function UserComment() {
  const { slug } = Route.useParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));
  const { userRating } = useSuspenseQuery(snackRatingsQueryOptions(data.id)).data;
  const rateSnack = useCommentSnack();
  const removeRating = useRemoveComment({ snackItemId: data.id, slug });

  if (isFormOpen) {
    return (
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle>Twoja ocena</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <UserCommentForm
            initialRating={userRating?.value ?? 0}
            initialBody={userRating?.body ?? null}
            snackItemId={data.id}
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
        <ItemContent>
          <div className="flex flex-row items-center gap-4">
            <ItemTitle>Brak oceny.</ItemTitle>
            <Button type="button" variant="default" size="sm" onClick={() => setIsFormOpen(true)}>
              <StarIcon />
              Oceń produkt
            </Button>
          </div>
        </ItemContent>
      </Item>
    );
  }

  const isEdited = userRating?.updatedAt !== null;
  const date = userRating?.updatedAt ?? userRating?.createdAt;
  const dateString = Temporal.Instant.from(date.toISOString());

  return (
    <Item variant="muted">
      <ItemHeader>
        <ItemTitle className="flex-wrap">
          <span>Twoja ocena</span>
          <span className="text-muted-foreground text-xs md:text-sm">
            {dateString ? dateString.toLocaleString("pl-PL") : null}
          </span>
          {isEdited && (
            <span className="text-xs text-muted-foreground md:text-sm">(edytowany)</span>
          )}
        </ItemTitle>
      </ItemHeader>
      <ItemContent>
        <UserCommentItem
          userRating={userRating.value}
          userBody={userRating?.body ?? null}
          onEdit={() => setIsFormOpen(true)}
          onRemove={() => removeRating.mutate({ snackItemId: data.id })}
        />
      </ItemContent>
    </Item>
  );
}
