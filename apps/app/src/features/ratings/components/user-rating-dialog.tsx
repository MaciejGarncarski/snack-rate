import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { CommonAlertDialog } from "#/components/layout/common-alert-dialog";
import { SnackRating } from "#/components/snacks/snack-rating";
import { SnackRatingPicker } from "#/components/snacks/snack-rating-picker";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Textarea } from "#/components/ui/textarea";
import { CaptchaField } from "#/features/captcha/components/captcha-field";
import { useRateSnack } from "#/features/ratings/queries/ratings.query-options";
import { MAXIMUM_REVIEW_BODY_LENGTH, rateSnackFormSchema } from "#/schemas/ratings";

type Props = {
  userRating: number | null;
  snackItemId: string;
  guestId: string;
  userBody: string | null;
  onRemove: () => void;
  isPending: boolean;
};

export function UserRatingDialog({
  userRating,
  snackItemId,
  guestId,
  userBody,
  isPending,
  onRemove,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rateSnack = useRateSnack();

  const form = useForm({
    defaultValues: {
      rating: userRating,
      body: userBody ?? "",
      captchaCode: "",
    },
    validators: {
      onChange: rateSnackFormSchema,
      onSubmit: rateSnackFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (value.rating === null) return;

      const trimmedBody = value.body.trim();
      handleRate({
        rating: value.rating,
        body: trimmedBody.length > 0 ? trimmedBody : null,
        captchaCode: value.captchaCode,
      });
      formApi.reset();
    },
  });

  const handleRate = ({
    rating,
    body,
    captchaCode,
  }: {
    rating: number;
    body: string | null;
    captchaCode: string;
  }) => {
    rateSnack.mutate(
      {
        snackItemId: snackItemId,
        rating,
        body,
        guestId,
        captchaCode,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: () => {
          form.resetField("captchaCode");
        },
      },
    );
  };

  const isRated = userRating !== null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-col md:flex-row">
        <div className="flex min-w-0 flex-col items-center gap-2">
          {isRated ? (
            <>
              <SnackRating rating={userRating} withText size="sm" />
              {userBody ? (
                <p className="line-clamp-3 text-sm text-muted-foreground">{userBody}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Bez komentarza.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nie oceniłeś jeszcze tego produktu.</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={() => handleOpenChange(true)}>
            {isRated ? "Zmień ocenę" : "Oceń produkt"}
          </Button>

          {isRated && (
            <CommonAlertDialog
              cancelText="Nie usuwaj"
              proceedText="Usuń"
              title="Usuń ocenę"
              description="Czy na pewno chcesz usunąć swoją ocenę?"
              onCancel={() => {}}
              onProceed={onRemove}
            >
              <Button type="button" variant="outline">
                Usuń ocenę
              </Button>
            </CommonAlertDialog>
          )}
        </div>
      </div>

      <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{isRated ? "Zmień ocenę" : "Oceń produkt"}</DialogTitle>
            <DialogDescription>
              {isRated
                ? "Zaktualizuj gwiazdki i opcjonalnie dopisz opinię."
                : "Wybierz ocenę gwiazdkową. Opinia tekstowa jest opcjonalna."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-6">
            <form.Field name="rating">
              {(field) => (
                <div className="flex flex-col items-center gap-4 py-1">
                  <SnackRatingPicker
                    currentRating={field.state.value}
                    onRate={field.handleChange}
                    disabled={isPending}
                  />
                  {field.state.value === null && (
                    <p className="text-xs text-muted-foreground">
                      Kliknij gwiazdki, aby wybrać ocenę.
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="body">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="review-body">Opinia (opcjonalnie)</FieldLabel>
                  <Textarea
                    id="review-body"
                    placeholder="Co sądzisz o smaku, chrupkości, cenie…?"
                    value={field.state.value}
                    maxLength={MAXIMUM_REVIEW_BODY_LENGTH}
                    disabled={isPending}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldDescription>
                    {field.state.value.length}/{MAXIMUM_REVIEW_BODY_LENGTH}
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

          <DialogFooter>
            <DialogClose variant="outline">Zamknij</DialogClose>
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
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
