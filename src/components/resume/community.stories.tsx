import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommunitySection } from "./community";

const meta = {
  title: "Resume/Sections/Community",
  component: CommunitySection,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommunitySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
