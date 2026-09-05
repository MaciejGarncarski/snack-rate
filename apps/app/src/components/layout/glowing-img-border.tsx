import { cn } from "cn";
import { useInView } from "react-intersection-observer";

type Props = {
  imgSrc: string;
  borderSize?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  children?: React.ReactNode;
};

const SIZE_CLASSES: Record<NonNullable<Props["borderSize"]>, string> = {
  xs: "p-0.5",
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
  xl: "p-3",
  xxl: "p-4",
};

export function GlowingImgBorder({ imgSrc, children, borderSize }: Props) {
  const { ref, inView } = useInView({
    rootMargin: "200px",
    threshold: 0,
  });

  if (children) {
    return (
      <div
        ref={ref}
        className={cn(
          SIZE_CLASSES[borderSize ?? "md"],
          "relative group overflow-hidden rounded-3xl w-full h-full",
        )}
      >
        <GlowingImgBorder imgSrc={imgSrc} borderSize={borderSize} />
        {children}
      </div>
    );
  }

  return (
    <>
      <div ref={ref} />
      {inView && (
        <img
          className="absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none select-none -translate-y-1/2 scale-200 inset-0 h-full w-full object-cover blur-[6px] saturate-150 opacity-5 transition-opacity duration-500 ease-out group-focus:animate-border-glow contrast-500 group-focus:running dark:opacity-10 dark:group-focus:opacity-25 dark:group-hover:opacity-25 group-focus:opacity-15 group-hover:animate-border-glow animate-border-glow paused group-hover:opacity-15 group-hover:running -z-10"
          src={imgSrc}
          alt=""
          aria-hidden="true"
        />
      )}
    </>
  );
}
