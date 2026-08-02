import { useMutation } from "@tanstack/react-query";
import type z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query";
import { UserRatingDialog } from "#/features/ratings/components/user-rating-dialog";
import {
  snackRatingsQueryOptions,
  useRateSnack,
} from "#/features/ratings/queries/ratings.query-options";
import { removeRatingFn } from "#/features/ratings/transport/ratings.server";
import type { removeRatingSchema } from "#/schemas/ratings";

type Props = {
  snackId: string;
  guestId: string;
  slug: string;
  userRating?: number | null;
  userBody?: string | null;
};

export function ReviewSection({ snackId, guestId, slug, userRating, userBody }: Props) {
  const rateSnack = useRateSnack();

  const removeRating = useMutation({
    mutationFn: (mutationData: z.input<typeof removeRatingSchema>) => {
      return removeRatingFn({ data: mutationData });
    },
    onSuccess: async (_, __, ___, { client }) => {
      await Promise.all([
        client.invalidateQueries(snackRatingsQueryOptions(snackId, guestId)),
        client.invalidateQueries(getSnackBySlugQueryOptions(slug)),
      ]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprawdź oceny tego produktu</CardTitle>
      </CardHeader>
      <CardContent>
        <Item variant="muted">
          <ItemHeader>
            <ItemTitle>Twoja ocena</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <UserRatingDialog
              isPending={rateSnack.isPending}
              userRating={userRating ?? null}
              userBody={userBody ?? null}
              snackItemId={snackId}
              guestId={guestId}
              onRemove={() => removeRating.mutate({ snackItemId: snackId, guestId })}
            />
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  );
}
