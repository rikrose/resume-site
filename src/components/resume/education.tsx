import { GraduationCap } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { useResume } from "@/content/context";
import { Section } from "./section";

export function EducationSection() {
  const resume = useResume();
  if (resume.education.length === 0) return null;

  return (
    <Section id="education" eyebrow="Education" title="Where I learned">
      <ul>
        {resume.education.map((e, i) => (
          <li key={`${e.institution}-${e.qualification}`}>
            {i > 0 && <Separator className="my-6" />}
            <div className="flex gap-4">
              <GraduationCap className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-lg font-semibold">{e.qualification}</h3>
                  {(e.start || e.end) && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {[e.start, e.end].filter(Boolean).join(" – ")}
                    </p>
                  )}
                </div>
                <p className="text-muted-foreground">{e.institution}</p>
                {e.notes && <p className="mt-2 text-sm text-foreground/80">{e.notes}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
