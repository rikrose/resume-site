/**
 * Visual regression tests: renders every story tagged "visual" (all of them,
 * unless a story opts out with `tags: ["!visual"]`) and compares a screenshot
 * of the page with the reference image in __screenshots__/.
 *
 *   vp test --project browser          compare
 *   vp test --project browser -u       accept changes / write new references
 *
 * Reference images depend on the OS and browser (font rendering differs), so
 * their names end in -chromium-<platform>.png. Commit them.
 */
import { composeStories, type composeStory } from "@storybook/react-vite";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { page } from "vite-plus/test/browser/context";

type StoryModule = Parameters<typeof composeStories>[0];
type ComposedStory = ReturnType<typeof composeStory>;

const modules = import.meta.glob<StoryModule>("./**/*.stories.tsx", { eager: true });

/** Small seeded PRNG, so "random" decoration lands in the same place each run. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * performative-ui animates with requestAnimationFrame (Aurora, StatCounter,
 * the canvas backgrounds) and setInterval (WordRoll), driven by
 * performance.now() and Math.random(). Those run on fake clocks and a seeded
 * random, and the test fast-forwards them by
 * SETTLE_MS: long enough for the stat counters to finish (1.6 s), short
 * enough that WordRoll still shows the first headline (2.2 s), which is also
 * what the prerendered page shows. Clocks are real again before the
 * screenshot, which the matcher needs.
 *
 * Stories tagged "realtime" run on real clocks throughout: their play
 * functions wait for things (Testing Library's waitFor polls with setInterval,
 * dialogs wait for animation frames to open). Keep performative-ui's animated
 * components out of realtime stories, or their screenshots will vary.
 */
const SETTLE_MS = 2000;

/**
 * Left out of the comparison (painted over in the screenshots). The typewriter
 * runs on setTimeout, which can't be faked: Storybook's renderer waits on it,
 * and the story never finishes rendering.
 */
const MASKED = ['[data-section="headline"][data-variant="typewriter"]'];

/**
 * Hidden (visibility: hidden) during screenshots, keeping the layout and
 * everything around them in the comparison. NodeGraphBackground re-seeds its
 * nodes from Math.random() and clears its canvas on every ResizeObserver
 * callback, and the browser can deliver one of those on a later frame of its
 * choosing (a "ResizeObserver loop" deferral). Waiting for it narrows the
 * window but can't close it, so its canvas isn't compared. Its story still
 * checks that it renders (play function, a11y).
 */
const HIDDEN = ['[data-section="background"][data-variant="nodeGraph"] canvas'];

/** Matches the viewport set for the browser projects in vite.config.ts. */
const VIEWPORT = { width: 1280, height: 800 };

function freezeClocks() {
  vi.useFakeTimers({
    toFake: [
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
      "setInterval",
      "clearInterval",
    ],
  });
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Resolves once the browser has delivered pending ResizeObserver callbacks.
 * Browsers deliver every observer's callbacks in the same rendering step, in
 * the order the observers were created, so a new observer's first callback
 * comes after those of observers that components created earlier. Works with
 * faked requestAnimationFrame: rendering steps still happen.
 */
function resizeObserversDelivered() {
  return new Promise<void>((resolve) => {
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      resolve();
    });
    observer.observe(document.documentElement);
  });
}

/**
 * Lets finite CSS animations and transitions (the dialog zooming in, a button
 * enabling) run to the end. Infinite ones are left to `animations: "disabled"`.
 */
async function settle() {
  const finite = document
    .getAnimations()
    .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity);
  await Promise.all(finite.map((a) => a.finished.catch(() => {})));
  await nextFrame();
  await nextFrame();
}

/** Restarts Math.random() at the same seed. */
function seedRandom() {
  vi.spyOn(Math, "random").mockImplementation(mulberry32(42));
}

/**
 * Resolves once the DOM has stopped changing: a full round of ResizeObserver
 * deliveries passes with no mutations. Components that mount late (inside
 * <ClientOnly>, after a second render) have then mounted, and their own
 * ResizeObservers have had their first callback.
 */
async function domSettled() {
  for (let round = 0; round < 20; round++) {
    let mutated = false;
    const watcher = new MutationObserver(() => (mutated = true));
    watcher.observe(document.body, { subtree: true, childList: true, attributes: true });
    await resizeObserversDelivered();
    await resizeObserversDelivered();
    watcher.disconnect();
    if (!mutated) return;
  }
  throw new Error("The story kept changing the DOM; can't take a stable screenshot");
}

beforeEach(async () => {
  // Undo the previous test's tall viewport here, and let the resize event
  // land, before clocks are frozen. A resize that arrives while they're
  // frozen queues a fake animation frame that never runs, and SlippyWords
  // then ignores every later resize, leaving the skills strip out of place.
  await page.viewport(VIEWPORT.width, VIEWPORT.height);
  await nextFrame();
  await nextFrame();
  seedRandom();
});

let hiddenStyle: HTMLStyleElement | undefined;

afterEach(() => {
  hiddenStyle?.remove();
  hiddenStyle = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

for (const [path, module] of Object.entries(modules)) {
  const stories = Object.entries(composeStories(module)) as [string, ComposedStory][];
  describe(path.replace(/^\.\//, ""), () => {
    for (const [name, Story] of stories) {
      test.skipIf(!Story.tags.includes("visual"))(name, async () => {
        const realtime = Story.tags.includes("realtime");

        // Tests run in an iframe the size of the viewport, so a full-page
        // screenshot means growing the viewport to fit the story. Render once
        // to measure, then render again at the final size: components that
        // measure the window on mount (the skills strip) then never see a
        // resize, and fonts are already loaded for the real render.
        await Story.run();
        await document.fonts.ready;
        const height = Math.max(VIEWPORT.height, document.documentElement.scrollHeight);
        await page.viewport(VIEWPORT.width, height);
        await nextFrame();
        await nextFrame();

        // The measuring render used up some random numbers; how many depends
        // on timing (NodeGraphBackground re-seeds on every resize callback).
        // Start the real render from the same point every time.
        seedRandom();
        if (!realtime) freezeClocks();
        await Story.run();
        // NodeGraphBackground mounts late (inside <ClientOnly>) and re-seeds
        // its nodes from Math.random() whenever its ResizeObserver fires. Let
        // all of that finish before time moves on, or the nodes end up
        // wherever the timing put them.
        await domSettled();
        if (!realtime) {
          vi.advanceTimersByTime(SETTLE_MS);
          // Back on real timers, the faked animation loops are never called
          // again: everything holds its settled frame for the screenshot.
          vi.useRealTimers();
        }
        await settle();
        // Where focus ends up after an interaction depends on timing (a button
        // that disables itself while sending drops it), and focus rings are
        // visible. Compare without focus.
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

        hiddenStyle = document.createElement("style");
        hiddenStyle.textContent = `${HIDDEN.join(", ")} { visibility: hidden !important; }`;
        document.head.append(hiddenStyle);

        await expect(page).toMatchScreenshot(Story.id, {
          // CSS animations (sparkles, glows, shimmer) go to their start or end
          // state, so they look the same in every run.
          screenshotOptions: {
            animations: "disabled",
            mask: [...document.querySelectorAll(MASKED.join(", "))],
          },
        });
      });
    }
  });
}
