import { create } from "storybook/theming";

/** The site's background, performative-ui's --pui-bg. The site is dark-only. */
export const SITE_BG = "#08080b";

/**
 * Theme for the Docs pages and the Storybook UI (manager.ts). Storybook styles them separately from the story
 * canvas and defaults to light, which doesn't match a dark-only site; stories
 * embedded in a Docs page also sit on this background. Colours and fonts are
 * performative-ui's (src/styles.css).
 */
export const docsTheme = create({
  base: "dark",
  appBg: "#0e0e13", // --pui-bg-elev
  appContentBg: SITE_BG,
  appPreviewBg: SITE_BG,
  appBorderColor: "#1f1f2b", // --pui-border
  barBg: "#0e0e13",
  inputBg: "#14141c", // --pui-bg-soft
  textColor: "#f4f4f6", // --pui-fg
  textMutedColor: "#a3a3b2", // --pui-fg-dim
  colorSecondary: "#7c3aed", // --pui-grad-from (violet palette)
  fontBase: '"Inter Variable", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono Variable", ui-monospace, monospace',
});
