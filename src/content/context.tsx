import { createContext, useContext } from "react";

import { resume } from "./resume";
import type { Resume } from "./types";

/**
 * The resume the components render. The default is the live content
 * (src/content/resume.ts), so the site needs no provider. Storybook provides
 * the placeholder content (src/content/sample-resume.ts) instead, so stories
 * and screenshot tests don't change when the real resume does.
 */
const ResumeContext = createContext<Resume>(resume);

export const ResumeProvider = ResumeContext.Provider;

export function useResume(): Resume {
  return useContext(ResumeContext);
}
