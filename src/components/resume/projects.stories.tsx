import type { Meta, StoryObj } from "@storybook/react-vite";

import { expectVariant } from "@/appearance/expect-variant";
import { ProjectsSection } from "./projects";

const meta = {
  title: "Resume/Sections/Projects",
  component: ProjectsSection,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cards: Story = {
  parameters: { appearance: { projects: "cards" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "projects", "cards"),
};

export const List: Story = {
  parameters: { appearance: { projects: "list" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "projects", "list"),
};
