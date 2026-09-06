type Props = {
  isPrimaryImage: boolean;
};

export function MainImageBadges({ isPrimaryImage }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium tracking-wide text-white dark:bg-white dark:text-zinc-900">
        Podgląd
      </span>
      {isPrimaryImage && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
          Okładka
        </span>
      )}
    </div>
  );
}
