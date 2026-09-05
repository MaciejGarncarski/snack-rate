import { useForm } from "@tanstack/react-form";

import { SnackRatingPicker } from "#/components/snacks/snack-rating-picker";
import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Textarea } from "#/components/ui/textarea";
import { useCommentSnack } from "#/features/comments/queries/use-comment-snack";
import { MAXIMUM_COMMENT_BODY_LENGTH, rateSnackFormSchema } from "#/schemas/comments";

type Props = {
  initialRating: number | null;
  initialBody: string | null;
  snackItemId: string;
  isPending: boolean;
  onCancel?: () => void;
  onRated?: () => void;
};

export function UserCommentForm({
  initialRating,
  initialBody,
  snackItemId,
  isPending,
  onCancel,
  onRated,
}: Props) {
  const rateSnack = useCommentSnack();

  const form = useForm({
    defaultValues: {
      rating: initialRating,
      body: initialBody ?? "",
    },
    validators: {
      onSubmit: rateSnackFormSchema,
    },
    onSubmit: ({ value }) => {
      if (value.rating === null) return;

      const trimmedBody = value.body.trim();
      rateSnack.mutate(
        {
          snackItemId,
          rating: value.rating,
          body: trimmedBody.length > 0 ? trimmedBody : null,
        },
        {
          onSuccess: () => {
            onRated?.();
          },
        },
      );
    },
  });

  return (
    <form
      className="flex w-full max-w-2xl mx-auto flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
        Dodawanie nowej oceny
      </h3>

      <div className="flex w-full flex-col gap-5">
        <form.Field name="rating">
          {(field) => (
            <SnackRatingPicker
              currentRating={field.state.value}
              onRate={field.handleChange}
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Field name="body">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="comment-body">Opinia (opcjonalnie)</FieldLabel>
              <Textarea
                id="comment-body"
                placeholder="Co sądzisz o smaku, chrupkości, cenie…?"
                value={field.state.value}
                maxLength={MAXIMUM_COMMENT_BODY_LENGTH}
                className="resize-y wrap-anywhere whitespace-pre-wrap w-full"
                disabled={isPending}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>
                {field.state.value.length}/{MAXIMUM_COMMENT_BODY_LENGTH}
              </FieldDescription>
            </Field>
          )}
        </form.Field>
      </div>

      <div className="flex w-full items-center gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" isDisabled={isPending} onPress={onCancel}>
            Anuluj
          </Button>
        )}

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            rating: state.values.rating,
          })}
        >
          {({ canSubmit, isSubmitting, rating }) => (
            <Button
              type="submit"
              isDisabled={!canSubmit || rating === null || isSubmitting || isPending}
            >
              {isPending ? "Zapisywanie…" : "Zapisz ocenę"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
