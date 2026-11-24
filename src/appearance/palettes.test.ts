import { describe, expect, test } from "vite-plus/test";

import { appearanceOptions } from "./options";
import { auroraBlobs, palettes, paletteStyle, rgba } from "./palettes";

describe("palettes", () => {
  test("there is a palette for every palette option, and no others", () => {
    expect(Object.keys(palettes).sort()).toEqual([...appearanceOptions.palette].sort());
  });

  test("violet is performative-ui's own palette, so the default look is unchanged", () => {
    expect(palettes.violet).toMatchObject({
      from: "#7c3aed",
      mid: "#ec4899",
      to: "#06b6d4",
    });
    // performative-ui's default Aurora blobs.
    expect(auroraBlobs("violet")).toEqual([
      { color: "rgba(124,58,237,0.45)", x: 20, y: 30, size: 60 },
      { color: "rgba(236,72,153,0.35)", x: 80, y: 25, size: 50 },
      { color: "rgba(6,182,212,0.3)", x: 50, y: 80, size: 50 },
    ]);
  });

  test("every colour is a 6-digit hex", () => {
    for (const [name, p] of Object.entries(palettes)) {
      for (const colour of [p.from, p.mid, p.to]) {
        expect(colour, name).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});

describe("paletteStyle", () => {
  test("sets the performative-ui accent variables and glows", () => {
    expect(paletteStyle("ocean")).toEqual({
      "--pui-grad-from": palettes.ocean.from,
      "--pui-grad-mid": palettes.ocean.mid,
      "--pui-grad-to": palettes.ocean.to,
      "--pui-glow": `0 0 24px ${rgba(palettes.ocean.from, 0.45)}`,
      "--pui-glow-strong": `0 0 48px ${rgba(palettes.ocean.from, 0.55)}, 0 0 96px ${rgba(palettes.ocean.mid, 0.25)}`,
      "--primary-foreground": palettes.ocean.onAccent,
    });
  });
});

describe("rgba", () => {
  test("converts hex and alpha to an rgba() string", () => {
    expect(rgba("#7c3aed", 0.45)).toBe("rgba(124,58,237,0.45)");
    expect(rgba("#ffffff", 1)).toBe("rgba(255,255,255,1)");
  });
});
