import type { ComponentType } from "react";
import { AsciiHero, Aurora, FloatingSparkles, NodeGraphBackground } from "performative-ui";
import { ClientOnly } from "@tanstack/react-router";

import {
  auroraBlobs,
  palettes,
  rgba,
  useAppearance,
  type AppearanceOption,
  type PaletteName,
} from "@/appearance";

type BackgroundProps = { palette: PaletteName };

/**
 * One component per `background` option. `satisfies` makes a new option in
 * src/appearance/options.ts a type error here until it is implemented.
 *
 * Canvas backgrounds and FloatingSparkles pick positions with Math.random()
 * as they render, so they can't match the prerendered HTML: they render in
 * the browser only, inside <ClientOnly>. They're decorative and fade in.
 */
const backgrounds = {
  aurora: ({ palette }) => (
    <>
      <Aurora blobs={auroraBlobs(palette)} />
      <ClientOnly>
        <FloatingSparkles count={14} />
      </ClientOnly>
    </>
  ),
  nodeGraph: ({ palette }) => {
    const p = palettes[palette];
    return (
      <ClientOnly>
        <NodeGraphBackground
          className="absolute inset-0"
          colors={[p.from, p.mid, p.to]}
          linkColor={p.from}
          baseOpacity={0.35}
        />
      </ClientOnly>
    );
  },
  ascii: ({ palette }) => {
    const p = palettes[palette];
    return (
      <ClientOnly>
        {/* Inline position: performative-ui's unlayered `.pui-ascii` rule sets
            position: relative, which beats Tailwind's layered `absolute` and
            leaves the field 0px tall, so it never draws. */}
        <AsciiHero
          variant="bare"
          style={{ position: "absolute", inset: 0 }}
          palette={[p.from, p.mid, p.to]}
          baseOpacity={0.16}
        />
      </ClientOnly>
    );
  },
  plain: ({ palette }) => {
    const p = palettes[palette];
    return (
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(60% 70% at 15% 0%, ${rgba(p.from, 0.22)}, transparent 70%)`,
            `radial-gradient(50% 60% at 90% 10%, ${rgba(p.mid, 0.12)}, transparent 70%)`,
          ].join(", "),
        }}
      />
    );
  },
} satisfies Record<AppearanceOption<"background">, ComponentType<BackgroundProps>>;

/** The hero's backdrop, chosen by `appearance` → `background`. */
export function HeroBackground() {
  const background = useAppearance("background");
  const palette = useAppearance("palette");
  const Background = backgrounds[background];
  return (
    <div
      aria-hidden
      data-section="background"
      data-variant={background}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <Background palette={palette} />
    </div>
  );
}
