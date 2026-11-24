import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { expectNoSection, expectVariant } from "@/appearance/expect-variant";
import { themes } from "@/appearance";
import { resume } from "@/content/resume";
import { sampleResume } from "@/content/sample-resume";
import { ResumePage } from "./resume-page";

const meta = {
  title: "Pages/Resume",
  component: ResumePage,
  args: { currentlyEmployed: false },
} satisfies Meta<typeof ResumePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default theme, as the site ships. Stories render the placeholder
 * resume (.storybook/preview.tsx), never the live one.
 */
export const OpenToWork: Story = {
  async play({ canvas, canvasElement }) {
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent(sampleResume.name);
    await expect(canvasElement.textContent).not.toContain(resume.name);
  },
};

export const Employed: Story = { args: { currentlyEmployed: true } };

// ── Themes ──────────────────────────────────────────────────────────────────
// Each pins a theme; every section must render that theme's choice.

async function expectTheme(container: HTMLElement, name: keyof typeof themes) {
  const theme = themes[name];
  await expectVariant(container, "background", theme.background);
  await expectVariant(container, "hero", theme.hero);
  await expectVariant(container, "headline", theme.headline);
  await expectVariant(container, "experience", theme.experience);
  await expectVariant(container, "skills", theme.skills);
  await expectVariant(container, "projects", theme.projects);
  await expectVariant(container, "footer", theme.footer);
  if (theme.banner === "none") await expectNoSection(container, "banner");
  else await expectVariant(container, "banner", theme.banner);
}

export const ThemePerformative: Story = {
  globals: { theme: "performative" },
  play: ({ canvasElement }) => expectTheme(canvasElement, "performative"),
};

export const ThemeMinimal: Story = {
  globals: { theme: "minimal" },
  play: ({ canvasElement }) => expectTheme(canvasElement, "minimal"),
};

export const ThemeNetwork: Story = {
  globals: { theme: "network" },
  play: ({ canvasElement }) => expectTheme(canvasElement, "network"),
};

export const ThemeTerminal: Story = {
  globals: { theme: "terminal" },
  play: ({ canvasElement }) => expectTheme(canvasElement, "terminal"),
};

// ── Banner ──────────────────────────────────────────────────────────────────

export const BannerNone: Story = {
  parameters: { appearance: { banner: "none" } },
  play: ({ canvasElement }) => expectNoSection(canvasElement, "banner"),
};

/** No banner while employed, whatever the setting. */
export const BannerHiddenWhenEmployed: Story = {
  args: { currentlyEmployed: true },
  parameters: { appearance: { banner: "sticky" } },
  play: ({ canvasElement }) => expectNoSection(canvasElement, "banner"),
};
