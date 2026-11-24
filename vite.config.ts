import { fileURLToPath } from "node:url";

import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vitest sets VITEST in its own process. Tests render components directly, so
// they skip the TanStack Start plugins (routing, SSR, prerender).
const isTest = Boolean(process.env.VITEST);

// Shared by both browser projects. A fixed viewport and one browser keep
// screenshots comparable between runs. Each instance needs a name that is
// unique across projects.
const browser = (project: string) => ({
  enabled: true,
  headless: true,
  provider: playwright(),
  instances: [
    {
      browser: "chromium" as const,
      name: `${project} (chromium)`,
      viewport: { width: 1280, height: 800 },
    },
  ],
});

const config = defineConfig({
  // Year for the footer copyright, fixed when the page is built. Computing it
  // at render time would differ between the prerendered HTML and the browser
  // once the year rolls over, causing a hydration mismatch.
  // Tests pin it, so the reference screenshots don't all change on 1 January.
  define: {
    __BUILD_YEAR__: JSON.stringify(isTest ? "2026" : String(new Date().getFullYear())),
  },
  fmt: { ignorePatterns: ["src/routeTree.gen.ts"] },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    tailwindcss(),
    !isTest &&
      tanstackStart({
        // Static site generation: the build renders "/" to a complete
        // dist/client/index.html, which React then hydrates in the browser. No
        // server runtime is needed for pages (dist/server is only used by the
        // prerender step). Everything rendered must come out the same at build
        // time and in the browser: put random, time- or window-dependent output
        // in an effect or <ClientOnly>.
        prerender: { enabled: true, crawlLinks: false, failOnError: true },
        pages: [{ path: "/" }],
      }),
    viteReact(),
  ]),
  test: {
    projects: [
      {
        // Plain logic in Node: the contact Worker, content checks, Storybook config.
        extends: true,
        test: {
          name: "unit",
          include: [
            "src/**/*.test.ts",
            "worker/**/*.test.ts",
            "scripts/**/*.test.ts",
            ".storybook/**/*.test.ts",
          ],
          environment: "node",
        },
      },
      {
        // Every story becomes a test: it must render, pass its play function
        // and have no accessibility violations.
        extends: true,
        plugins: [
          storybookTest({
            configDir: fileURLToPath(new URL(".storybook", import.meta.url)),
            storybookScript: "vp run storybook --no-open",
          }),
        ],
        test: {
          name: "storybook",
          browser: browser("storybook"),
          // No setup file: the plugin applies .storybook/preview.tsx itself.
        },
      },
      {
        // Browser tests, including the screenshot tests of every story
        // (src/visual.browser.test.tsx). Reference images are in
        // __screenshots__/ next to the test file.
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: browser("browser"),
          // Applies .storybook/preview.tsx to stories composed in tests.
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});

export default config;
