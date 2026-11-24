import { Sparkle } from "performative-ui";

export function Section({
  id,
  eyebrow,
  title,
  variant,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  /** The appearance option rendered, for sections that have them. */
  variant?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-section={variant ? id : undefined}
      data-variant={variant}
      className="scroll-mt-20 py-16 sm:py-20"
    >
      <hgroup className="mb-10">
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          <Sparkle className="text-sm" aria-hidden />
          {eyebrow}
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-[var(--pui-grad-from)] via-[var(--pui-grad-mid)]/40 to-transparent"
          />
        </p>
        <h2
          id={`${id}-title`}
          className="mt-3 font-serif text-4xl font-normal tracking-tight sm:text-5xl"
        >
          {title}
        </h2>
      </hgroup>
      {children}
    </section>
  );
}
