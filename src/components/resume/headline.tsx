import type { ComponentType } from "react";
import { GradientText, Rotator, WordRoll } from "performative-ui";

import { useAppearance, type AppearanceOption } from "@/appearance";

type HeadlineProps = { headlines: string[] };

/** One component per `headline` option. */
const headlineStyles = {
  wordRoll: ({ headlines }) =>
    headlines.length > 1 ? <WordRoll words={headlines} gradient /> : <>{headlines[0]}</>,
  typewriter: ({ headlines }) => (
    <GradientText>
      <Rotator words={headlines} />
    </GradientText>
  ),
  static: ({ headlines }) => <>{headlines.join(" · ")}</>,
} satisfies Record<AppearanceOption<"headline">, ComponentType<HeadlineProps>>;

/** The rotating (or not) headline under the name. */
export function Headline({ headlines }: HeadlineProps) {
  const variant = useAppearance("headline");
  const Style = headlineStyles[variant];
  return (
    <span data-section="headline" data-variant={variant}>
      <Style headlines={headlines} />
    </span>
  );
}
