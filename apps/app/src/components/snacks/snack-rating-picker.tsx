import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "#/lib/utils";

type StarButtonProps = {
  starIndex: number;
  filled: boolean;
  onRate: (value: number) => void;
  onHover: (value: number) => void;
  onLeave: () => void;
  disabled: boolean;
};

function StarButton({ starIndex, filled, onRate, onHover, onLeave, disabled }: StarButtonProps) {
  return (
    <button
      type="button"
      className={cn("size-7", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
      onMouseEnter={() => {
        if (!disabled) onHover(starIndex);
      }}
      onMouseLeave={onLeave}
      onClick={() => {
        if (!disabled) onRate(starIndex);
      }}
      disabled={disabled}
      aria-label={`Oceń na ${starIndex}`}
    >
      <StarIcon
        className={cn("size-7 text-amber-400", filled ? "fill-amber-400" : "fill-transparent")}
        strokeWidth={1.5}
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <StarButton
            key={starIndex}
            starIndex={starIndex}
            filled={starIndex <= activeValue}
            onRate={handleRate}
            onHover={setHoveredValue}
            onLeave={() => setHoveredValue(0)}
            disabled={isDisabled}
          />
        ))}
      </div>
    </div>
  );
}
