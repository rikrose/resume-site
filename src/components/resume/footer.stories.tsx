import type { Meta, StoryObj } from "@storybook/react-vite";

import { expectVariant } from "@/appearance/expect-variant";
import { Footer } from "./footer";

const meta = {
  title: "Resume/Sections/Footer",
  component: Footer,
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bigback: Story = {
  parameters: { appearance: { footer: "bigback" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "footer", "bigback"),
};

export const Simple: Story = {
  parameters: { appearance: { footer: "simple" } },
  play: ({ canvasElement }) => expectVariant(canvasElement, "footer", "simple"),
};
