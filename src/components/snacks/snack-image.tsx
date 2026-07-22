import { ImageWithPlaceholder } from "@/components/layout/image-with-placeholder";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  src: string;
  alt: string;
  size?: Size;
};

const sizeClasses: Record<Size, string> = {
  sm: "w-16 rounded-sm",
  md: "w-32 rounded",
  lg: "w-48 rounded",
  xl: "w-64 rounded-lg",
};

export function SnackImage({ src, alt, size = "md" }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-4/5 overflow-hidden bg-muted",
        sizeClasses[size] || sizeClasses["md"],
      )}
    >
      <ImageWithPlaceholder src={src} alt={alt} />
    </div>
  );
}
