import { useForm } from "@tanstack/react-form";

import { SnackRatingPicker } from "#/components/snacks/snack-rating-picker";
import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Textarea } from "#/components/ui/textarea";
import { CaptchaField } from "#/features/captcha/components/captcha-field";
import { regenerateCaptcha } from "#/features/captcha/store";
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
      captchaCode: "",
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
          captchaCode: value.captchaCode,
        },
        {
          onError: () => {
            form.resetField("captchaCode");
            regenerateCaptcha();
          },
          onSuccess: () => {
            onRated?.();
          },
        },
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-5 py-6">
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
                disabled={isPending}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>
                {field.state.value.length}/{MAXIMUM_COMMENT_BODY_LENGTH}
              </FieldDescription>
            </Field>
          )}
        </form.Field>

        <form.Field name="captchaCode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <CaptchaField
                value={field.state.value}
                onChange={field.handleChange}
                name={field.name}
                onBlur={field.handleBlur}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
              />
            );
          }}
        </form.Field>
      </div>

      <div className="flex shrink-0 items-center gap-2">
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
