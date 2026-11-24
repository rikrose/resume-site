import type { Meta, StoryObj } from "@storybook/react-vite";

import { expectVariant } from "@/appearance/expect-variant";
import { ExperienceSection } from "./experience";

const meta = {
  title: "Resume/Sections/Experience",
  component: ExperienceSection,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Story />
      </div>
    ),
  ],
  args: { currentlyEmployed: false },
} satisfies Meta<typeof ExperienceSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cards: Story = {
  parameters: { appearance: { experience: "cards" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "experience", "cards"),
};

/** The current role's card "breathes" while employed. */
export const CardsEmployed: Story = {
  ...Cards,
  args: { currentlyEmployed: true },
};

export const Timeline: Story = {
  parameters: { appearance: { experience: "timeline" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "experience", "timeline"),
};
