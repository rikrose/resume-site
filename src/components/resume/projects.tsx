import type { ComponentType } from "react";
import { GlassCard } from "performative-ui";
import { ArrowUpRight } from "lucide-react";

import { useAppearance, type AppearanceOption } from "@/appearance";
import { Badge } from "@/components/ui/badge";
import { useResume } from "@/content/context";
import type { Project } from "@/content/types";
import { Section } from "./section";

function Tech({ tech }: { tech?: string[] }) {
  if (!tech || tech.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {tech.map((t) => (
        <Badge key={t} variant="outline" className="font-mono">
          {t}
        </Badge>
      ))}
    </div>
  );
}

/** One component per `projects` option. */
const layouts = {
  cards: ({ projects }) => (
    <ul className="grid gap-6 sm:grid-cols-2">
      {projects.map((p) => (
        <li key={p.name} className="flex">
          <GlassCard glowOnHover className="flex w-full flex-col">
            <GlassCard.Title>{p.name}</GlassCard.Title>
            <GlassCard.Body>{p.description}</GlassCard.Body>
            <Tech tech={p.tech} />
            {p.href && (
              <GlassCard.Link
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-4"
              >
                View project
              </GlassCard.Link>
            )}
          </GlassCard>
        </li>
      ))}
    </ul>
  ),
  list: ({ projects }) => (
    <ul className="divide-y divide-border">
      {projects.map((p) => (
        <li key={p.name} className="py-6 first:pt-0 last:pb-0">
          <h3 className="text-lg font-semibold">
            {p.href ? (
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline"
              >
                {p.name}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            ) : (
              p.name
            )}
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {p.description}
          </p>
          <Tech tech={p.tech} />
        </li>
      ))}
    </ul>
  ),
} satisfies Record<AppearanceOption<"projects">, ComponentType<{ projects: Project[] }>>;

export function ProjectsSection() {
  const resume = useResume();
  const variant = useAppearance("projects");
  if (resume.projects.length === 0) return null;
  const Layout = layouts[variant];

  return (
    <Section id="projects" eyebrow="Projects" title="Things I've built" variant={variant}>
      <Layout projects={resume.projects} />
    </Section>
  );
}
