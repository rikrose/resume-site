import { createContext, useContext } from "react";

import { siteConfig } from "@/config";
import type { Appearance, AppearanceSection } from "./options";
import { resolveAppearance } from "./resolve";

/**
 * The resolved look-and-feel. The default value comes from src/config.ts, so
 * the site needs no provider; Storybook wraps stories in one to show other
 * themes and options.
 */
const AppearanceContext = createContext<Appearance>(resolveAppearance(siteConfig.appearance));

export const AppearanceProvider = AppearanceContext.Provider;

export function useAppearance(): Appearance;
export function useAppearance<S extends AppearanceSection>(section: S): Appearance[S];
export function useAppearance(section?: AppearanceSection) {
  const appearance = useContext(AppearanceContext);
  return section ? appearance[section] : appearance;
}
