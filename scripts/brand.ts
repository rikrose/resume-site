/**
 * Accent colours for the generated favicons and link-preview image: the
 * palette chosen in src/config.ts (`appearance`). Re-run `vp run favicons`
 * and `vp run og-image` after changing it.
 */
import { palettes } from "../src/appearance/palettes.ts";
import { resolveAppearance } from "../src/appearance/resolve.ts";
import { siteConfig } from "../src/config.ts";

const palette = palettes[resolveAppearance(siteConfig.appearance).palette];

/** Gradient stops, start to end. */
export const brandGradient = [palette.from, palette.mid, palette.to] as const;
