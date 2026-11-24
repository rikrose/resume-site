import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: { disableTelemetry: true },
  // Storybook builds on the project's vite.config.ts. The TanStack Start
  // plugins there take over the build (routing, SSR, prerendering), which a
  // Storybook build must not do; stories render components directly. They
  // are dropped here, keeping Tailwind, React and the `define`s.
  async viteFinal(viteConfig) {
    const isTanStack = (p: unknown) =>
      typeof p === "object" &&
      p !== null &&
      "name" in p &&
      typeof p.name === "string" &&
      p.name.startsWith("tanstack");
    const flatten = (list: unknown[]): unknown[] =>
      list.flatMap((p) => (Array.isArray(p) ? flatten(p) : [p]));
    viteConfig.plugins = flatten(viteConfig.plugins ?? []).filter(
      (p) => !isTanStack(p),
    ) as typeof viteConfig.plugins;
    return viteConfig;
  },
};

export default config;
