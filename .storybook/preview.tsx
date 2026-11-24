import type { Preview } from "@storybook/react-vite";

import {
  AppearanceProvider,
  defaultTheme,
  paletteStyle,
  resolveAppearance,
  themes,
  type ThemeName,
} from "@/appearance";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/content/context";
import { sampleResume } from "@/content/sample-resume";
import "../src/styles.css";
import { docsTheme } from "./theme";

const preview: Preview = {
  // "visual": every story gets a screenshot test (src/visual.browser.test.tsx).
  // Opt a story out with `tags: ["!visual"]`.
  tags: ["autodocs", "visual"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { disabled: true },
    // Dark Docs pages: Storybook themes them separately from the canvas.
    docs: { theme: docsTheme },
    a11y: {
      // Accessibility violations fail the story's test, not just warn.
      test: "error",
    },
  },
  // Theme switcher in the toolbar. Stories can pin one with `globals: { theme }`.
  globalTypes: {
    theme: {
      description: "Look-and-feel theme (src/appearance/themes.ts)",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: Object.keys(themes),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: defaultTheme },
  decorators: [
    // `parameters.appearance` holds per-story section choices, laid over the
    // toolbar's theme, the same way `appearance.sections` overrides
    // `appearance.theme` in src/config.ts.
    (Story, { globals, parameters }) => {
      const appearance = resolveAppearance({
        theme: globals.theme as ThemeName,
        sections: parameters.appearance,
      });
      // The site is dark-only: src/routes/__root.tsx puts `dark` on <html>,
      // and the palette's variables, which this mirrors so that portals
      // (the contact dialog) pick them up too.
      const root = document.documentElement;
      root.classList.add("dark");
      for (const [name, value] of Object.entries(paletteStyle(appearance.palette))) {
        root.style.setProperty(name, String(value));
      }
      return (
        // Stories show placeholder content, never the live resume, so they
        // and their screenshots don't change when the real resume does.
        <ResumeProvider value={sampleResume}>
          <AppearanceProvider value={appearance}>
            <TooltipProvider delayDuration={150}>
              <Story />
            </TooltipProvider>
          </AppearanceProvider>
        </ResumeProvider>
      );
    },
  ],
};

export default preview;
