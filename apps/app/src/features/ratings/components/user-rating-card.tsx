import { ThumbsUpIcon } from "lucide-react";
import { useState } from "react";

import { CommonAlertDialog } from "#/components/layout/common-alert-dialog";
import { SnackRatingPicker } from "#/components/snacks/snack-rating-picker";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";

type Props = {
  userRating: number | null;
  onRate: (rating: number) => Promise<void>;
  onRemove: () => void;
  isPending: boolean;
};

export function UserRatingCard({ userRating, onRate, isPending, onRemove }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="gap-0 rounded-2xl border border-border/70 py-0 shadow-sm">
      <CardContent className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ThumbsUpIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Twoja ocena</p>
            <p className="text-sm text-muted-foreground">
              {userRating ? "Kliknij, aby zmienić." : "Kliknij gwiazdki, aby ocenić."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-12">
          <SnackRatingPicker currentRating={userRating} onRate={onRate} disabled={isPending} />

          {userRating && (
            <div className="ml-auto">
              <CommonAlertDialog
                cancelText="Nie usuwaj"
                proceedText="Usuń"
                title="Usuń ocenę"
                open={isOpen}
                onOpenChange={setIsOpen}
                description="Czy na pewno chcesz usunąć swoją ocenę?"
                onCancel={() => {
                  setIsOpen(false);
                }}
                onProceed={() => {
                  onRemove();
                  setIsOpen(false);
                }}
              >
                <Button type="submit" variant="destructive">
                  Usuń ocenę
                </Button>
              </CommonAlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
