import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { getColorClass } from "#/components/snacks/snack-rating";
import { cn } from "#/lib/utils";

const RATINGS = [
  { value: 1, label: "Bardzo słaba" },
  { value: 2, label: "Słaba" },
  { value: 3, label: "Średnia" },
  { value: 4, label: "Dobra" },
  { value: 5, label: "Świetna" },
];

type StarButtonProps = {
  starIndex: number;
  filled: boolean;
  color: string;
  onRate: (value: number) => void;
  onHover: (value: number) => void;
  onLeave: () => void;
  disabled: boolean;
};

function StarButton({
  starIndex,
  filled,
  color,
  onRate,
  onHover,
  onLeave,
  disabled,
}: StarButtonProps) {
  return (
    <button
      type="button"
      aria-label={filled ? `Twoja ocena: ${starIndex}/5` : `Oceń na ${starIndex}`}
      className={cn(
        "rounded-lg p-0.5 outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/60 hover:scale-110 active:scale-90",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      onMouseEnter={() => {
        if (!disabled) onHover(starIndex);
      }}
      onMouseLeave={onLeave}
      onClick={() => {
        if (!disabled) onRate(starIndex);
      }}
      disabled={disabled}
    >
      <StarIcon
        strokeWidth={1.5}
        className={cn(
          "size-7 transition-all duration-150 ease-out",
          filled ? cn("fill-current", color) : "fill-transparent text-amber-400",
        )}
      />
    </button>
  );
}

type SnackRatingPickerProps = {
  currentRating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
};

export function SnackRatingPicker({ currentRating, onRate, disabled }: SnackRatingPickerProps) {
  const [hoveredValue, setHoveredValue] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayRating, setDisplayRating] = useState<number | null>(currentRating);

  useEffect(() => {
    setDisplayRating(currentRating);
  }, [currentRating]);

  const isDisabled = disabled || isSubmitting;
  const activeValue = hoveredValue || displayRating || 0;
  const activeColor = activeValue ? getColorClass(activeValue) : null;
  const activeLabel = RATINGS.find((rating) => rating.value === activeValue);

  const handleRate = async (value: number) => {
    if (isDisabled || value === displayRating) return;

    setIsSubmitting(true);

    try {
      await onRate(value);
      setDisplayRating(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {RATINGS.map(({ value }) => (
          <StarButton
            key={value}
            starIndex={value}
            filled={value <= activeValue}
            color={activeColor ?? "text-amber-400"}
            onRate={handleRate}
            onHover={setHoveredValue}
            onLeave={() => setHoveredValue(0)}
            disabled={isDisabled}
          />
        ))}
      </div>

      <div className="flex h-5 w-full items-center justify-center" aria-live="polite">
        {activeLabel ? (
          <span className={cn("text-sm leading-none font-semibold tabular-nums", activeColor)}>
            {activeValue}/5 · {activeLabel.label}
          </span>
        ) : (
          <span className="text-sm leading-none text-muted-foreground">
            Kliknij gwiazdki, aby wybrać ocenę.
          </span>
        )}
      </div>
    </div>
  );
}
