import { Star as StarIcon } from "lucide-react";

import { pluralizeRatings } from "#/lib/pluralizer";
import { cn } from "#/lib/utils";

export function getColorClass(rating: number): string {
  if (rating <= 2) return "text-red-500";
  if (rating <= 4) return "text-orange-500";
  if (rating <= 6) return "text-yellow-500";
  if (rating <= 7) return "text-lime-500";
  if (rating <= 9) return "text-green-600";
  return "text-cyan-500";
}

const Star = ({
  fill = 0,
  size = "md",
  color = "text-yellow-500",
}: {
  fill?: number;
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
}) => {
  const sizeClass = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  }[size];

  const percentage = Math.min(100, Math.max(0, fill * 100));

  return (
    <div className={cn("relative shrink-0", sizeClass)}>
      <StarIcon
        className={cn(
          "absolute inset-0",
          sizeClass,
          "text-muted-foreground/20 fill-muted-foreground/20",
        )}
        strokeWidth={1.75}
        fill="transparent"
      />

      {percentage > 0 && (
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <StarIcon className={cn(sizeClass, color)} fill="currentColor" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );
};

type SnackRatingProps = {
  rating: number;
  ratingCount?: number;
  withText?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
};

const fontSizesMap = {
  xs: { value: "text-xs", count: "text-xs" },
  sm: { value: "text-sm", count: "text-sm" },
  md: { value: "text-base", count: "text-base" },
  lg: { value: "text-2xl", count: "text-base" },
} satisfies Record<"xs" | "sm" | "md" | "lg", { value: string; count: string }>;

export function SnackRating({ rating, ratingCount, withText, size = "md" }: SnackRatingProps) {
  const value = Math.max(0, Math.min(10, rating));
  const starValue = value / 2;
  const color = getColorClass(value);

  const gapClass =
    size === "xs" ? "gap-0.5" : size === "sm" ? "gap-1" : size === "lg" ? "gap-2" : "gap-1.5";

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex", gapClass)}>
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, starValue - i));
          return <Star key={i} fill={fill} size={size} color={color} />;
        })}
      </div>

      {withText && (
        <span className={cn("tabular-nums relative top-px font-bold", fontSizesMap[size].value)}>
          {value.toFixed(1)}
        </span>
      )}

      {ratingCount !== undefined && (
        <span
          className={cn(
            "tabular-nums relative top-px text-muted-foreground",
            fontSizesMap[size].count,
          )}
        >
          - {ratingCount} {pluralizeRatings(ratingCount)}
        </span>
      )}
    </div>
  );
}
