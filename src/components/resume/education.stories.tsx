import type { Meta, StoryObj } from "@storybook/react-vite";

import { EducationSection } from "./education";

const meta = {
  title: "Resume/Sections/Education",
  component: EducationSection,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EducationSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
