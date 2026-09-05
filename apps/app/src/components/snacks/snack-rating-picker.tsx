import { Field } from "#/components/ui/field";
import { cn } from "#/lib/utils";

type SnackRatingPickerProps = {
  currentRating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
};

const MIN_VALUE = 1;
const MAX_VALUE = 10;

const RATING_LABELS: Record<number, string> = {
  1: "Okropna",
  2: "Bardzo słaba",
  3: "Słaba",
  4: "Niezbyt dobra",
  5: "Przeciętna",
  6: "Niezła",
  7: "Dobra",
  8: "Bardzo dobra",
  9: "Świetna",
  10: "Rewelacyjna",
};

const TIER_CLASSES = {
  text: {
    low: "text-destructive",
    mid: "text-warning",
    high: "text-success",
  },
  chip: {
    low: "bg-destructive/15 border-destructive/40 text-destructive",
    mid: "bg-warning/15 border-warning/40 text-warning",
    high: "bg-success/15 border-success/40 text-success",
  },
} as const;

function getTier(rating: number): "low" | "mid" | "high" {
  if (rating <= 3) return "low";
  if (rating <= 6) return "mid";
  return "high";
}

export function SnackRatingPicker({ currentRating, onRate, disabled }: SnackRatingPickerProps) {
  const tier = currentRating === null ? null : getTier(currentRating);
  const readoutColor = tier !== null ? TIER_CLASSES.text[tier] : "text-muted-foreground";
  const displayValue = currentRating !== null ? String(currentRating) : "-";
  const label = currentRating !== null ? RATING_LABELS[currentRating] : "Wybierz ocenę";

  return (
    <Field className="bg-input/50 rounded-2xl px-4 py-5">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p
            className={cn(
              "text-xl font-semibold leading-none tabular-nums transition-colors",
              readoutColor,
            )}
          >
            {displayValue}
            <span className="text-sm font-normal text-muted-foreground"> /{MAX_VALUE}</span>
          </p>
          <p className="min-h-4 text-sm text-muted-foreground">{label}</p>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: MAX_VALUE }, (_, index) => {
            const value = index + MIN_VALUE;
            const isSelected = currentRating === value;
            const valueTier = getTier(value);

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onRate(value)}
                className={cn(
                  "flex h-9 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
                  isSelected
                    ? TIER_CLASSES.chip[valueTier]
                    : "border-input bg-background text-muted-foreground hover:border-ring hover:text-foreground",
                )}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    </Field>
  );
}
