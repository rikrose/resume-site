import { ArrowUpRight, HeartHandshake } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { useResume } from "@/content/context";
import { Section } from "./section";

export function CommunitySection() {
  const resume = useResume();
  if (resume.community.length === 0) return null;

  return (
    <Section id="community" eyebrow="Community service" title="Giving back">
      <ul>
        {resume.community.map((c, i) => {
          const dates = c.start ? `${c.start} – ${c.end ?? "Present"}` : c.end;
          return (
            <li key={`${c.organization}-${c.role}`}>
              {i > 0 && <Separator className="my-6" />}
              <div className="flex gap-4">
                <HeartHandshake
                  className="mt-1 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-lg font-semibold">{c.role}</h3>
                    {dates && <p className="font-mono text-xs text-muted-foreground">{dates}</p>}
                  </div>
                  <p className="text-muted-foreground">
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {c.organization}
                        <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    ) : (
                      c.organization
                    )}
                  </p>
                  {c.description && (
                    <p className="mt-2 text-sm text-foreground/80">{c.description}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
