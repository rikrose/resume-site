import type { ComponentType } from "react";
import { GlassCard, StatusDot } from "performative-ui";
import { ArrowUpRight, Briefcase } from "lucide-react";

import { useAppearance, type AppearanceOption } from "@/appearance";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config";
import { useResume } from "@/content/context";
import type { Experience } from "@/content/types";
import { Section } from "./section";

// ── Parts shared by every layout ────────────────────────────────────────────

function Company({ job }: { job: Experience }) {
  if (!job.href) return <>{job.company}</>;
  return (
    <a
      href={job.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline"
    >
      {job.company}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}

function Dates({ job }: { job: Experience }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
      {!job.end && <StatusDot />}
      {job.start} – {job.end ?? "Present"}
      {job.location && <span>· {job.location}</span>}
    </p>
  );
}

function Details({ job }: { job: Experience }) {
  return (
    <>
      {job.highlights.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/80 marker:text-muted-foreground">
          {job.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      {job.tech && job.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tech.map((t) => (
            <Badge key={t} variant="outline" className="font-mono">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}

// ── Layouts ─────────────────────────────────────────────────────────────────

type LayoutProps = { jobs: Experience[]; currentlyEmployed: boolean };

/** One component per `experience` option. */
const layouts = {
  cards: ({ jobs, currentlyEmployed }) => (
    <ol className="flex flex-col gap-6">
      {jobs.map((job) => (
        <li key={`${job.company}-${job.start}`}>
          <GlassCard glowOnHover breathing={!job.end && currentlyEmployed}>
            <GlassCard.Icon>
              <Briefcase className="size-5" aria-hidden />
            </GlassCard.Icon>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <GlassCard.Title>
                {job.role} · <Company job={job} />
              </GlassCard.Title>
              <Dates job={job} />
            </div>
            {job.summary && <GlassCard.Body>{job.summary}</GlassCard.Body>}
            <Details job={job} />
          </GlassCard>
        </li>
      ))}
    </ol>
  ),
  timeline: ({ jobs }) => (
    <ol className="ml-1.5 border-l border-border">
      {jobs.map((job) => (
        <li key={`${job.company}-${job.start}`} className="relative pb-12 pl-8 last:pb-0">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[7px] size-3.5 rounded-full border-2 border-background bg-[var(--pui-grad-from)]"
          />
          <Dates job={job} />
          <h3 className="mt-1 text-lg font-semibold">
            {job.role} · <Company job={job} />
          </h3>
          {job.summary && <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>}
          <Details job={job} />
        </li>
      ))}
    </ol>
  ),
} satisfies Record<AppearanceOption<"experience">, ComponentType<LayoutProps>>;

export function ExperienceSection({
  currentlyEmployed = siteConfig.currentlyEmployed,
}: {
  /** Defaults to the site setting; stories override it to show both states. */
  currentlyEmployed?: boolean;
}) {
  const resume = useResume();
  const variant = useAppearance("experience");
  if (resume.experience.length === 0) return null;
  const Layout = layouts[variant];

  return (
    <Section id="experience" eyebrow="Experience" title="Where I've worked" variant={variant}>
      <Layout jobs={resume.experience} currentlyEmployed={currentlyEmployed} />
    </Section>
  );
}
