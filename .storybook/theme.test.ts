import { describe, expect, test } from "vite-plus/test";

import preview from "./preview";
import { docsTheme, SITE_BG } from "./theme";

describe("Storybook docs theme", () => {
  test("is dark, like the site (which has no light mode)", () => {
    expect(docsTheme.base).toBe("dark");
  });

  test("uses the site's background behind docs and embedded stories", () => {
    expect(SITE_BG).toBe("#08080b"); // performative-ui's --pui-bg
    expect(docsTheme.appContentBg).toBe(SITE_BG);
    expect(docsTheme.appPreviewBg).toBe(SITE_BG);
  });

  test("is the theme every Docs page uses", () => {
    expect(preview.parameters?.docs?.theme).toBe(docsTheme);
  });
});
