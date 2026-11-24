import type { Appearance } from "./options";

/**
 * Named presets. A theme must choose every section, so adding a section to
 * `appearanceOptions` is a type error here until each theme picks an option.
 */
export const themes = {
  /** The original look: aurora, glass cards, rolling headline, big footer. */
  performative: {
    palette: "violet",
    background: "aurora",
    hero: "classic",
    headline: "wordRoll",
    banner: "sticky",
    experience: "cards",
    skills: "strip",
    projects: "cards",
    footer: "bigback",
  },
  /** Quiet and document-like: no motion, monochrome, timeline and lists. */
  minimal: {
    palette: "mono",
    background: "plain",
    hero: "centered",
    headline: "static",
    banner: "none",
    experience: "timeline",
    skills: "badges",
    projects: "list",
    footer: "simple",
  },
  /** Cool blues over a drifting node graph. */
  network: {
    palette: "ocean",
    background: "nodeGraph",
    hero: "classic",
    headline: "typewriter",
    banner: "sticky",
    experience: "cards",
    skills: "strip",
    projects: "cards",
    footer: "bigback",
  },
  /** Green-on-black ASCII field and a typed headline. */
  terminal: {
    palette: "forest",
    background: "ascii",
    hero: "classic",
    headline: "typewriter",
    banner: "sticky",
    experience: "timeline",
    skills: "badges",
    projects: "list",
    footer: "simple",
  },
} as const satisfies Record<string, Appearance>;

export type ThemeName = keyof typeof themes;

/** Used when the config names no theme. */
export const defaultTheme: ThemeName = "performative";
