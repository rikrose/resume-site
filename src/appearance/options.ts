import type { ThemeName } from "./themes";

/**
 * Every look-and-feel choice the site offers, one list per section of the
 * page. The lists are the source of truth for the types: a selection in
 * src/config.ts that isn't listed here is a type error.
 *
 * To add an option: add its name here, implement it where the section is
 * rendered (each section maps every option to a component, so TypeScript
 * points at the place), add a story for it, and record its screenshot.
 */
export const appearanceOptions = {
  /** Accent colours: gradients, glows, highlights. */
  palette: ["violet", "ocean", "ember", "forest", "mono"],
  /** Animated backdrop behind the hero. */
  background: ["aurora", "nodeGraph", "ascii", "plain"],
  /** Hero layout. */
  hero: ["classic", "centered"],
  /** How the `headlines` under the name are shown. */
  headline: ["wordRoll", "typewriter", "static"],
  /** "Open to new roles" banner at the top, while not employed. */
  banner: ["sticky", "none"],
  experience: ["cards", "timeline"],
  skills: ["strip", "badges"],
  projects: ["cards", "list"],
  footer: ["bigback", "simple"],
} as const;

export type AppearanceSection = keyof typeof appearanceOptions;

/** The options for one section, e.g. `AppearanceOption<"hero">` is "classic" | "centered". */
export type AppearanceOption<S extends AppearanceSection> = (typeof appearanceOptions)[S][number];

/** A complete selection: one option for every section. */
export type Appearance = { [S in AppearanceSection]: AppearanceOption<S> };

/** The `appearance` block in src/config.ts. */
export interface AppearanceConfig {
  /** Preset for every section. Omit for the default theme. */
  theme?: ThemeName;
  /** Per-section choices. Each one overrides the theme for that section. */
  sections?: Partial<Appearance>;
}
