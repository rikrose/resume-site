import { Button, EyebrowPill, GradientText, StatCounter } from "performative-ui";
import { Download, MapPin } from "lucide-react";

import { useAppearance, type AppearanceOption } from "@/appearance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { siteConfig } from "@/config";
import { useResume } from "@/content/context";
import { cn } from "@/lib/utils";
import { useContact } from "./contact-dialog";
import { ContactIcon } from "./contact-icon";
import { Headline } from "./headline";
import { HeroBackground } from "./hero-background";

/** Class names per `hero` layout, for the parts that differ. */
const layouts = {
  classic: {
    top: "flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between",
    block: "",
    row: "",
    stats: "sm:grid-cols-3",
  },
  centered: {
    top: "flex flex-col-reverse items-center gap-6 text-center",
    block: "mx-auto text-center",
    row: "justify-center",
    stats: "text-center sm:grid-cols-3",
  },
} satisfies Record<AppearanceOption<"hero">, Record<"top" | "block" | "row" | "stats", string>>;

export function Hero({
  currentlyEmployed = siteConfig.currentlyEmployed,
}: {
  /** Defaults to the site setting; stories override it to show both states. */
  currentlyEmployed?: boolean;
}) {
  const resume = useResume();
  const currentJob = resume.experience.find((job) => !job.end);
  const { openContact } = useContact();
  const variant = useAppearance("hero");
  const layout = layouts[variant];

  return (
    <header data-section="hero" data-variant={variant} className="relative isolate overflow-hidden">
      <HeroBackground />

      <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
        <div className={layout.top}>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <GradientText>{resume.name}</GradientText>
          </h1>

          {currentlyEmployed ? (
            <EyebrowPill statusColor="var(--pui-grad-from)">
              {currentJob
                ? `Currently ${currentJob.role} at ${currentJob.company}`
                : "Currently employed"}
            </EyebrowPill>
          ) : (
            <EyebrowPill statusColor="var(--pui-success)">Open to new opportunities</EyebrowPill>
          )}
        </div>

        <p
          className={cn(
            "mt-4 text-2xl font-medium text-muted-foreground sm:text-3xl",
            layout.block,
          )}
        >
          <Headline headlines={resume.headlines} />
        </p>

        {resume.location && (
          <p
            className={cn("mt-4 flex items-center gap-2 text-sm text-muted-foreground", layout.row)}
          >
            <MapPin className="size-4" aria-hidden />
            {resume.location}
          </p>
        )}

        <p
          className={cn("mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85", layout.block)}
        >
          {resume.summary}
        </p>

        <div className={cn("mt-8 flex flex-wrap items-center gap-3", layout.row)}>
          {!currentlyEmployed && (
            <Button variant="glow" size="lg" sparkle onClick={openContact} aria-haspopup="dialog">
              Get in touch
            </Button>
          )}
          {resume.resumePdf && (
            <Button as="a" href={resume.resumePdf} variant="ghost" size="lg" download>
              {/* Button wraps children in a plain <span>; Tailwind makes <svg> block-level,
                  so lay the icon and label out explicitly on one line. */}
              <span className="inline-flex items-center gap-2 align-top">
                <Download className="size-4" aria-hidden />
                Download PDF
              </span>
            </Button>
          )}
          <Button
            as="a"
            href="#experience"
            variant={currentlyEmployed ? "shimmer" : "ghost"}
            size="lg"
          >
            View experience
          </Button>
        </div>

        {resume.contact.length > 0 && (
          <ul className={cn("mt-8 flex flex-wrap gap-2", layout.row)} aria-label="Contact links">
            {resume.contact.map((c) => (
              <li key={c.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={c.label}
                      className="grid size-10 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground backdrop-blur transition-colors hover:border-input hover:text-foreground"
                    >
                      <ContactIcon kind={c.kind} className="size-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{c.label}</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        )}

        {resume.stats.length > 0 && (
          <dl
            className={cn("mt-14 grid grid-cols-1 gap-6 border-t border-border pt-8", layout.stats)}
          >
            {resume.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="order-first text-4xl font-semibold tracking-tight">
                  <StatCounter target={s.value} durationMs={1600} />
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
