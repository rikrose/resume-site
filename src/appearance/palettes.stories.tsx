import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ContactProvider } from "@/components/resume/contact-dialog";
import { ExperienceSection } from "@/components/resume/experience";
import { Hero } from "@/components/resume/hero";
import { palettes, type PaletteName } from "./palettes";

/** The hero and a section of cards, enough to see every accent colour in use. */
function Sample() {
  return (
    <ContactProvider>
      <Hero />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <ExperienceSection />
      </div>
    </ContactProvider>
  );
}

const meta = {
  title: "Appearance/Palettes",
  component: Sample,
} satisfies Meta<typeof Sample>;

export default meta;
type Story = StoryObj<typeof meta>;

function paletteStory(name: PaletteName): Story {
  return {
    parameters: { appearance: { palette: name } },
    async play() {
      const style = getComputedStyle(document.documentElement);
      await expect(style.getPropertyValue("--pui-grad-from").trim()).toBe(palettes[name].from);
    },
  };
}

export const Violet = paletteStory("violet");
export const Ocean = paletteStory("ocean");
export const Ember = paletteStory("ember");
export const Forest = paletteStory("forest");
export const Mono = paletteStory("mono");
