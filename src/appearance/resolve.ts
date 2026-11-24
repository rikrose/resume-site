import type { Appearance, AppearanceConfig } from "./options";
import { defaultTheme, themes } from "./themes.ts";

/**
 * Turns the config's `appearance` block into a complete selection: the theme
 * (or the default theme), with any per-section choices laid over it.
 */
export function resolveAppearance(config: AppearanceConfig = {}): Appearance {
  const base: Appearance = themes[config.theme ?? defaultTheme];
  const overrides = Object.fromEntries(
    Object.entries(config.sections ?? {}).filter(([, value]) => value !== undefined),
  );
  return { ...base, ...overrides };
}
