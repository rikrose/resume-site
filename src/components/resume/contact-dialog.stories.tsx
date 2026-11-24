import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";

import { ContactProvider, useContact, type TurnstileApi } from "./contact-dialog";

/**
 * Stands in for Cloudflare Turnstile, so the stories run offline and the
 * widget looks the same every time. It "passes" at once with a fixed token,
 * and again after each reset, as the real widget does.
 */
const turnstileStub: TurnstileApi = (() => {
  let issue: (() => void) | undefined;
  return {
    render(el, options) {
      el.textContent = "Turnstile (stub)";
      el.className += " grid place-items-center rounded-lg border border-dashed text-xs";
      issue = () => options.callback?.("stub-token");
      setTimeout(issue, 0);
      return "stub-widget";
    },
    reset() {
      if (issue) setTimeout(issue, 0);
    },
    remove() {
      issue = undefined;
    },
  };
})();

function OpenButton() {
  const { openContact } = useContact();
  return (
    <button type="button" onClick={openContact} className="m-8 underline">
      Get in touch
    </button>
  );
}

/** Replaces fetch for one story with a canned /api/contact response. */
function mockContactApi(status: number, body: object) {
  const spy = spyOn(window, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  return () => spy.mockRestore();
}

const meta = {
  title: "Resume/Contact dialog",
  component: ContactProvider,
  // Real clocks in the screenshot tests: the play functions wait for the
  // dialog to open and for Turnstile (src/visual.browser.test.tsx).
  tags: ["realtime"],
  args: { children: <OpenButton /> },
  beforeEach() {
    window.turnstile = turnstileStub;
    return () => {
      delete window.turnstile;
    };
  },
  // Opens the dialog; the dialog is portalled to <body>, outside the canvas.
  async play({ canvas }) {
    await userEvent.click(canvas.getByRole("button", { name: "Get in touch" }));
    const dialog = await within(document.body).findByRole("dialog");
    const heading = within(dialog).getByRole("heading", { name: "Get in touch" });
    // The dialog fades in.
    await waitFor(() => expect(heading).toBeVisible());
  },
} satisfies Meta<typeof ContactProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

async function fillAndSend() {
  const dialog = within(within(document.body).getByRole("dialog"));
  await userEvent.type(dialog.getByLabelText("Name"), "Sam Sender");
  await userEvent.type(dialog.getByLabelText("Email"), "sam@example.com");
  await userEvent.type(dialog.getByLabelText("Message"), "Hello!");
  const send = dialog.getByRole("button", { name: "Send message" });
  // Enabled once Turnstile has issued its token.
  await waitFor(() => expect(send).toBeEnabled());
  await userEvent.click(send);
  return dialog;
}

export const SendsMessage: Story = {
  tags: ["!visual"],
  beforeEach: () => mockContactApi(200, { ok: true }),
  async play(context) {
    await meta.play(context);
    const dialog = await fillAndSend();

    await expect(await dialog.findByText("Message sent")).toBeVisible();
    await expect(window.fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
    const [, init] = (window.fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]!;
    await expect(JSON.parse(init.body as string)).toEqual({
      name: "Sam Sender",
      email: "sam@example.com",
      message: "Hello!",
      website: "",
      turnstileToken: "stub-token",
    });
  },
};

export const ShowsServerError: Story = {
  beforeEach: () => mockContactApi(429, { ok: false, error: "rate_limited" }),
  async play(context) {
    await meta.play(context);
    const dialog = await fillAndSend();

    await expect(await dialog.findByRole("alert")).toHaveTextContent(
      "Too many messages in a short time. Please wait a minute and try again.",
    );
    // The form stays open with the visitor's text, ready to retry: Turnstile
    // is reset (tokens are single-use) and issues a new token.
    await expect(dialog.getByLabelText("Message")).toHaveValue("Hello!");
    const send = dialog.getByRole("button", { name: "Send message" });
    await waitFor(() => expect(send).toBeEnabled());
  },
};
