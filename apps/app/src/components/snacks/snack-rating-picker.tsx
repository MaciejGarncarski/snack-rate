import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "#/lib/utils";

type StarButtonProps = {
  starIndex: number;
  fill: number;
  onRate: (value: number) => void;
  onHover: (value: number) => void;
  onLeave: () => void;
  disabled: boolean;
};

function getValueFromEvent(e: React.MouseEvent<HTMLButtonElement>, starIndex: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;

  return x < rect.width / 2 ? starIndex - 0.5 : starIndex;
}

function StarButton({ starIndex, fill, onRate, onHover, onLeave, disabled }: StarButtonProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    onHover(getValueFromEvent(e, starIndex));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    onRate(getValueFromEvent(e, starIndex));
  };

  return (
    <button
      type="button"
      className={cn(
        "relative size-7",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeave}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Oceń na ${starIndex}`}
    >
      <StarIcon
        className="absolute inset-0 size-7 text-amber-400 fill-transparent"
        strokeWidth={1.5}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <StarIcon className="size-7 text-amber-400 fill-amber-400" strokeWidth={1.5} />
        </div>
      </div>
    </button>
  );
}

type SnackRatingPickerProps = {
  currentRating: number | null;
  onRate: (rating: number) => Promise<void>;
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
  const activeValue = hoveredValue > 0 ? hoveredValue : (displayRating ?? 0);

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
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fill = Math.max(0, Math.min(1, activeValue - (starIndex - 1)));

          return (
            <StarButton
              key={starIndex}
              starIndex={starIndex}
              fill={fill}
              onRate={handleRate}
              onHover={setHoveredValue}
              onLeave={() => setHoveredValue(0)}
              disabled={isDisabled}
            />
          );
        })}
      </div>

      {hoveredValue > 0 ? (
        <span className="min-w-[3ch] text-right text-sm font-bold tabular-nums text-amber-400/80">
          {hoveredValue.toFixed(1)}
        </span>
      ) : displayRating !== null ? (
        <span className="min-w-[3ch] text-right text-sm font-bold tabular-nums text-amber-400/80">
          {displayRating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
