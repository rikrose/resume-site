/**
 * Story helper: asserts which variant a section rendered. Sections mark their
 * root element with data-section and data-variant for this.
 */
import { expect } from "storybook/test";

import type { AppearanceOption, AppearanceSection } from "./options";

export async function expectVariant<S extends AppearanceSection>(
  container: HTMLElement,
  section: S,
  variant: AppearanceOption<S>,
) {
  const el = container.querySelector(`[data-section="${section}"]`);
  await expect(el, `no element with data-section="${section}"`).not.toBeNull();
  await expect(el).toHaveAttribute("data-variant", variant);
}

/** Asserts a section rendered nothing (e.g. `banner: "none"`). */
export async function expectNoSection(container: HTMLElement, section: AppearanceSection) {
  await expect(container.querySelector(`[data-section="${section}"]`)).toBeNull();
}
