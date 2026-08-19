import { Image } from "#/components/image/image";
import { cn } from "#/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  src: string;
  alt: string;
  size?: Size;
};

const sizeClasses = {
  sm: "w-16 rounded-sm",
  md: "w-32 rounded",
  lg: "w-48 rounded",
  xl: "w-64 rounded-lg",
} satisfies Record<Size, string>;

export function SnackImage({ src, alt, size = "md" }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-4/5 overflow-hidden bg-muted",
        sizeClasses[size] || sizeClasses["md"],
      )}
    >
      <Image src={src} alt={alt} />
    </div>
  );
}
