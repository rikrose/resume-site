import { expect, test } from "vite-plus/test";

import { palettes, resolveAppearance } from "../src/appearance/index.ts";
import { siteConfig } from "../src/config.ts";
import { brandGradient } from "./brand.ts";

test("the generated images use the configured palette", () => {
  const p = palettes[resolveAppearance(siteConfig.appearance).palette];
  expect(brandGradient).toEqual([p.from, p.mid, p.to]);
});
