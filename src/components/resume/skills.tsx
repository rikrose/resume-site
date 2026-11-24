import { SlippyWords } from "performative-ui";

import { useAppearance } from "@/appearance";
import { Badge } from "@/components/ui/badge";
import { useResume } from "@/content/context";
import { Section } from "./section";

/**
 * `skills` options: "strip" adds a sliding strip of every skill above the
 * grouped badges; "badges" is the badges alone.
 */
export function SkillsSection() {
  const resume = useResume();
  const variant = useAppearance("skills");
  if (resume.skills.length === 0) return null;

  // Decorative strip: two rows built from every skill, padded so the
  // sliding never exposes an empty edge.
  const all = resume.skills.flatMap((g) => g.items);
  const half = Math.ceil(all.length / 2);
  const pad = (row: string[]) => (row.length ? Array.from({ length: 3 }, () => row).flat() : row);
  const rows = [pad(all.slice(0, half)), pad(all.slice(half))].filter((r) => r.length > 0);

  return (
    <Section id="skills" eyebrow="Skills" title="What I work with" variant={variant}>
      {variant === "strip" && (
        <div aria-hidden className="-mx-4 mb-10 sm:-mx-6">
          {/* .pui-slippy clips its overflow, and the pills sit flush against its
              edges at fractional pixel positions, which slices off the bottom
              row's border. A little vertical padding keeps them clear of it. */}
          <SlippyWords rows={rows} fade className="py-1" />
        </div>
      )}
      <dl className="grid gap-8 sm:grid-cols-2">
        {resume.skills.map((group) => (
          <div key={group.group}>
            <dt className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {group.group}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Badge key={item} variant="secondary" className="px-3 py-1 text-sm">
                  {item}
                </Badge>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
