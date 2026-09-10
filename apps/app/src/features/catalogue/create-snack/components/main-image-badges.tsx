import { TriangleAlert } from "lucide-react";

type Props = {
  isPrimaryImage: boolean;
  isLowResolution?: boolean;
};

export function MainImageBadges({ isPrimaryImage, isLowResolution }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium tracking-wide text-white dark:bg-white dark:text-zinc-900">
        Podgląd
      </span>
      {isPrimaryImage && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
          Okładka
        </span>
      )}
      {isLowResolution && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
          <TriangleAlert className="size-3" />
          Słaba rozdzielczość
        </span>
      )}
    </div>
  );
}
