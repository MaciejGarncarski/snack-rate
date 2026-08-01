import { useState } from "react";

import { CommonAlertDialog } from "#/components/layout/common-alert-dialog";
import { SnackRating } from "#/components/snacks/snack-rating";
import { SnackRatingPicker } from "#/components/snacks/snack-rating-picker";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
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
import { MAXIMUM_REVIEW_BODY_LENGTH } from "#/schemas/ratings";

type Props = {
  userRating: number | null;
  userBody: string | null;
  onRate: (rating: number, body: string | null) => void;
  onRemove: () => void;
  isPending: boolean;
};

export function UserRatingDialog({ userRating, userBody, onRate, isPending, onRemove }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(userRating);
  const [body, setBody] = useState(userBody ?? "");

  const isRated = userRating !== null;
  const canSubmit = selectedRating !== null && !isPending;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedRating(userRating);
      setBody(userBody ?? "");
    }
    setIsOpen(open);
  };

  const handleSubmit = async () => {
    if (selectedRating === null) return;

    const trimmedBody = body.trim();
    await onRate(selectedRating, trimmedBody.length > 0 ? trimmedBody : null);
    setIsOpen(false);
  };

  return (
    <>
      <Card className="gap-0 rounded-2xl border border-border/70 py-0 shadow-sm">
        <CardContent className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
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
              {isRated ? "Zmień ocenę" : "Oceń"}
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
        </CardContent>
      </Card>

      <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <DialogHeader>
          <DialogTitle>{isRated ? "Zmień ocenę" : "Oceń produkt"}</DialogTitle>
          <DialogDescription>
            {isRated
              ? "Zaktualizuj gwiazdki i opcjonalnie dopisz opinię."
              : "Wybierz ocenę gwiazdkową. Opinia tekstowa jest opcjonalna."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-6">
          <div className="flex flex-col items-center gap-4 py-1">
            <SnackRatingPicker
              currentRating={selectedRating}
              onRate={(rating) => {
                setSelectedRating(rating);
              }}
              disabled={isPending}
            />
            {selectedRating === null && (
              <p className="text-xs text-muted-foreground">Kliknij gwiazdki, aby wybrać ocenę.</p>
            )}
          </div>

          <Field>
            <FieldLabel htmlFor="review-body">Opinia (opcjonalnie)</FieldLabel>
            <Textarea
              id="review-body"
              placeholder="Co sądzisz o smaku, chrupkości, cenie…?"
              value={body}
              maxLength={MAXIMUM_REVIEW_BODY_LENGTH}
              disabled={isPending}
              onChange={(e) => setBody(e.target.value)}
            />
            <FieldDescription>
              {body.length}/{MAXIMUM_REVIEW_BODY_LENGTH}
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter>
          <DialogClose variant="outline">Zamknij</DialogClose>
          <Button type="button" onClick={handleSubmit} isDisabled={!canSubmit}>
            {isPending ? "Zapisywanie…" : "Zapisz ocenę"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
