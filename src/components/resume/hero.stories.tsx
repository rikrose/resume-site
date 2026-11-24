import type { Meta, StoryObj } from "@storybook/react-vite";

import { expectVariant } from "@/appearance/expect-variant";
import { ContactProvider } from "./contact-dialog";
import { Hero } from "./hero";

const meta = {
  title: "Resume/Hero",
  component: Hero,
  decorators: [
    (Story) => (
      <ContactProvider>
        <Story />
      </ContactProvider>
    ),
  ],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenToWork: Story = { args: { currentlyEmployed: false } };

export const Employed: Story = { args: { currentlyEmployed: true } };

// ── Backgrounds ─────────────────────────────────────────────────────────────

export const BackgroundAurora: Story = {
  parameters: { appearance: { background: "aurora" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "background", "aurora"),
};

export const BackgroundNodeGraph: Story = {
  parameters: { appearance: { background: "nodeGraph" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "background", "nodeGraph"),
};

export const BackgroundAscii: Story = {
  parameters: { appearance: { background: "ascii" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "background", "ascii"),
};

export const BackgroundPlain: Story = {
  parameters: { appearance: { background: "plain" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "background", "plain"),
};

// ── Layouts ─────────────────────────────────────────────────────────────────

export const LayoutClassic: Story = {
  parameters: { appearance: { hero: "classic" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "hero", "classic"),
};

export const LayoutCentered: Story = {
  parameters: { appearance: { hero: "centered" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "hero", "centered"),
};

// ── Headlines ───────────────────────────────────────────────────────────────

export const HeadlineWordRoll: Story = {
  parameters: { appearance: { headline: "wordRoll" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "headline", "wordRoll"),
};

export const HeadlineTypewriter: Story = {
  parameters: { appearance: { headline: "typewriter" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "headline", "typewriter"),
};

export const HeadlineStatic: Story = {
  parameters: { appearance: { headline: "static" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "headline", "static"),
};
