// The Storybook UI around the stories (sidebar, toolbar, panels). Dark always,
// in the same theme as the Docs pages: the site has no light mode, so a light
// frame (Storybook's default when the OS is in light mode) would misrepresent it.
import { addons } from "storybook/manager-api";

import { docsTheme } from "./theme";

addons.setConfig({ theme: docsTheme });
