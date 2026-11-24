import { expect, test, vi } from "vite-plus/test";

import { docsTheme } from "./theme";

const setConfig = vi.hoisted(() => vi.fn());
vi.mock("storybook/manager-api", () => ({ addons: { setConfig } }));

test("the Storybook UI (sidebar, toolbar) is dark, whatever the OS setting", async () => {
  await import("./manager");
  expect(setConfig).toHaveBeenCalledWith(expect.objectContaining({ theme: docsTheme }));
});
