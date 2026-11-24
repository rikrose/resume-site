import { describe, expect, expectTypeOf, test } from "vite-plus/test";

import { appearanceOptions, type Appearance, type AppearanceConfig } from "./options";
import { resolveAppearance } from "./resolve";
import { defaultTheme, themes } from "./themes";

describe("resolveAppearance", () => {
  test("no config gives the default theme", () => {
    expect(resolveAppearance()).toEqual(themes[defaultTheme]);
    expect(resolveAppearance({})).toEqual(themes[defaultTheme]);
  });

  test("the default theme is the original look", () => {
    expect(defaultTheme).toBe("performative");
    expect(themes.performative).toEqual({
      palette: "violet",
      background: "aurora",
      hero: "classic",
      headline: "wordRoll",
      banner: "sticky",
      experience: "cards",
      skills: "strip",
      projects: "cards",
      footer: "bigback",
    });
  });

  test("a theme selects every section", () => {
    expect(resolveAppearance({ theme: "minimal" })).toEqual(themes.minimal);
  });

  test("section selections override the theme", () => {
    const resolved = resolveAppearance({
      theme: "minimal",
      sections: { hero: "classic", palette: "ocean" },
    });
    expect(resolved).toEqual({ ...themes.minimal, hero: "classic", palette: "ocean" });
  });

  test("section selections without a theme override the default theme", () => {
    expect(resolveAppearance({ sections: { footer: "simple" } })).toEqual({
      ...themes[defaultTheme],
      footer: "simple",
    });
  });

  test("an explicitly undefined section falls back to the theme", () => {
    expect(resolveAppearance({ theme: "network", sections: { hero: undefined } }).hero).toBe(
      themes.network.hero,
    );
  });

  test("selections are type-checked against the option lists", () => {
    expectTypeOf<Appearance["hero"]>().toEqualTypeOf<"classic" | "centered">();
    // @ts-expect-error: not a hero option
    const bad: AppearanceConfig = { sections: { hero: "sideways" } };
    // @ts-expect-error: not a theme
    const badTheme: AppearanceConfig = { theme: "vaporwave" };
    expect([bad, badTheme]).toHaveLength(2);
  });
});

describe("themes", () => {
  test("every theme picks a valid option for every section", () => {
    for (const [name, theme] of Object.entries(themes)) {
      for (const [section, options] of Object.entries(appearanceOptions)) {
        expect(options, `${name}.${section}`).toContain(theme[section as keyof Appearance]);
      }
    }
  });

  test("every section has at least one option", () => {
    for (const [section, options] of Object.entries(appearanceOptions)) {
      expect(options.length, section).toBeGreaterThan(0);
    }
  });
});
