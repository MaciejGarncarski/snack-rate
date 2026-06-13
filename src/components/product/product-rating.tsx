import { cn } from "#/lib/utils";

const Star = ({ fill = 0, size = "md" }: { fill?: number; size?: "xs" | "sm" | "md" | "lg" }) => {
  const sizeClass =
    size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className={cn("relative", sizeClass)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={cn("absolute top-0 left-0 text-slate-500", sizeClass)}
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
          className={cn("text-yellow-500", sizeClass)}
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      </div>
    </div>
  );
};

type ProductRatingProps = {
  rating: number;
  withText?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
};

export function ProductRating({ rating, withText, size = "md" }: ProductRatingProps) {
  const value = Math.max(0, Math.min(5, rating));

  const gapClass =
    size === "xs" ? "gap-0.5" : size === "sm" ? "gap-1" : size === "lg" ? "gap-2" : "gap-1.5";

  return (
    <div className="flex items-center gap-3">
      {withText && <span className="text-lg font-bold">{value.toFixed(1)}</span>}

      <div className={cn(`flex`, gapClass)}>
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return <Star key={i} fill={fill} size={size} />;
        })}
      </div>
    </div>
  );
}
