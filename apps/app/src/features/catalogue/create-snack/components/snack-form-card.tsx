type Props = {
  children: React.ReactNode;
  description: string;
  step: string;
  title: string;
};

export function SnackFormCard({ children, description, step, title }: Props) {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-1.5">
        <span className="mb-2 inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {step}. {title}
        </span>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
