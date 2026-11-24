// Applies .storybook/preview.tsx (styles, decorators, a11y settings) to
// stories composed with composeStories() in the `browser` project, such as
// the screenshot tests. The `storybook` project doesn't need this: the
// Storybook Vitest plugin applies the preview itself.
import { setProjectAnnotations } from "@storybook/react-vite";
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { beforeAll } from "vite-plus/test";

import * as projectAnnotations from "./preview";

const annotations = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

beforeAll(annotations.beforeAll);
