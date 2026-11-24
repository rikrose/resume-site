import type { Meta, StoryObj } from "@storybook/react-vite";

import { expectVariant } from "@/appearance/expect-variant";
import { SkillsSection } from "./skills";

const meta = {
  title: "Resume/Sections/Skills",
  component: SkillsSection,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SkillsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strip: Story = {
  parameters: { appearance: { skills: "strip" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "skills", "strip"),
};

export const Badges: Story = {
  parameters: { appearance: { skills: "badges" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "skills", "badges"),
};
