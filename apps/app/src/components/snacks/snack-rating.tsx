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
  const sizeClass =
    size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className={cn("relative", sizeClass)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={cn(
          "absolute top-0 left-0 dark:text-input dark:fill-input text-input/40 fill-primary/20",
          sizeClass,
        )}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </svg>

      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${fill * 100}%` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn(color, sizeClass)}
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      </div>
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
  md: { value: "text-base", count: "text-sm" },
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
        <span className={cn("text-xs text-muted-foreground", fontSizesMap[size].count)}>
          ({ratingCount} {pluralizeRatings(ratingCount)})
        </span>
      )}
    </div>
  );
}
