import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import type z from "zod";

import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query";
import { UserReviewForm } from "#/features/ratings/components/user-review-form";
import { UserReviewItem } from "#/features/ratings/components/user-review-item";
import {
  snackRatingsQueryOptions,
  useRateSnack,
} from "#/features/ratings/queries/ratings.query-options";
import { removeRatingFn } from "#/features/ratings/transport/ratings.server";
import { Route } from "#/routes/_app/produkt/$slug/route";
import type { removeRatingSchema } from "#/schemas/ratings";

export function UserReview() {
  const { guestId } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));
  const ratings = useSuspenseQuery(snackRatingsQueryOptions(data.id, guestId)).data;
  const rateSnack = useRateSnack();

  const removeRating = useMutation({
    mutationFn: (mutationData: z.input<typeof removeRatingSchema>) => {
      return removeRatingFn({ data: mutationData });
    },
    onSuccess: async (_, __, ___, { client }) => {
      await Promise.all([
        client.invalidateQueries(snackRatingsQueryOptions(data.id, guestId)),
        client.invalidateQueries(getSnackBySlugQueryOptions(slug)),
      ]);
    },
  });

  const userRating = ratings.userRating;
  const isRated = userRating !== null;
  const isEdited = ratings.userRating?.updatedAt !== null;
  const instant = Temporal.Instant.from(
    userRating?.updatedAt?.toISOString() ?? new Date().toISOString(),
  );

  if (isFormOpen) {
    return (
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle>Twoja ocena</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <UserReviewForm
            initialRating={userRating?.value ?? 0}
            initialBody={ratings.userRating?.body ?? null}
            snackItemId={data.id}
            guestId={guestId}
            isPending={rateSnack.isPending}
            onCancel={() => setIsFormOpen(false)}
            onRated={() => setIsFormOpen(false)}
          />
        </ItemContent>
      </Item>
    );
  }

  if (isRated) {
    return (
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle>
            <span>Twoja ocena</span>
            <span className="text-muted-foreground">- {instant.toLocaleString("pl-PL")}</span>
            {isEdited && <span className="text-muted-foreground"> - (edytowany)</span>}
          </ItemTitle>
        </ItemHeader>
        <ItemContent>
          <UserReviewItem
            userRating={userRating.value}
            userBody={ratings.userRating?.body ?? null}
            onEdit={() => setIsFormOpen(true)}
            onRemove={() => removeRating.mutate({ snackItemId: data.id, guestId })}
          />
        </ItemContent>
      </Item>
    );
  }

  return (
    <Item variant="muted">
      <ItemContent>
        <div className="flex flex-row items-center gap-4">
          <ItemTitle>Brak oceny.</ItemTitle>
          <Button type="button" variant="default" size="sm" onPress={() => setIsFormOpen(true)}>
            <StarIcon />
            Oceń produkt
          </Button>
        </div>
      </ItemContent>
    </Item>
  );
}
