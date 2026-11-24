# resume-website

A personal resume site, served at your own domain (e.g. https://resume.example.com). It is one prerendered page
for recruiters and hiring managers. It shows experience, skills, projects, education and
community work, links to a downloadable PDF, and has a contact form that emails the site owner. While
`currentlyEmployed` is `false` in `src/config.ts`, the page also shows an "open to new roles"
banner and call to action.

The site is kept out of search results on purpose (`noindex`), but social preview bots must still
be able to read it. Don't "fix" either of those. See README.md → "Social previews and search".

`docs/getting-started.md` walks a new owner from accounts to deployment; keep it in step with
config, scripts and deployment changes. README.md is the human-facing guide (content editing, one-time Cloudflare/Resend/Turnstile setup,
deploying). This file covers what an agent needs to work on the code safely.

## Using Vite+, the Unified Toolchain for the Web

This project uses Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint,
Oxfmt and Vite Task. Vite+ wraps runtime management, package management and frontend tooling in a
single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and
`vp build`. Run `vp help` to list commands and `vp <command> --help` for details on one.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

### Built-in commands vs scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a
`vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do
different things. This matters here:

- **Always build with `vp run build`, never bare `vp build`.** The `build` script runs
  `scripts/write-csp.ts` after Vite, which fills the inline-script hashes into the CSP in
  `dist/client/_headers`. Without that step the deployed page's inline scripts are blocked.
- `vp run dev` adds `--port 3000`; `vp dev` uses Vite's default port.

### Running scripts

The scripts in `scripts/` run with plain Node (`node scripts/<file>.ts`, Node ≥ 22) through its
built-in TypeScript type stripping. Keep them to erasable syntax: no enums, namespaces or parameter
properties, and import local files with an explicit `.ts` extension. For one-off scripts that need
more than that, use `vpx <file>`; don't add tsx or ts-node.

### Tool versions

`vp toolchain` shows the versions in the active Vite+ release (`vp toolchain vite` for one tool).
`vp why <package>` shows the dependency graph. Vite+ and Vite are pinned together in the `catalog`
in `pnpm-workspace.yaml` (`vite` is aliased to `@voidzero-dev/vite-plus-core`); change them there,
not in `package.json`. So are `vitest` and `@vitest/browser-playwright`, which must match the
Vitest version bundled in `vite-plus` exactly (`vp toolchain` shows it). Bump all four together.

### Review checklist

- Run `vp install` after pulling changes and before starting.
- Run `vp check` to format, lint and type-check.
- Run `vp test` to run all tests (see "Testing" below). It needs Chromium for Playwright once per
  machine: `pnpm exec playwright install chromium`.
- Run `vp run build` to confirm the prerender still succeeds (`failOnError` is on) and the CSP step
  finds the inline scripts.
- To exercise the contact form or the real headers, use `vp run preview:worker` (needs `.dev.vars`;
  copy `.dev.vars.example`).
- If setup, runtime or package-manager behavior looks wrong, run `vp env doctor` and include its
  output when asking for help.

## How the site works

- **One prerendered page.** TanStack Start renders `/` to `dist/client/index.html` at build time and
  React hydrates it in the browser. There is no server rendering at request time. Whatever renders
  must be identical at build time and in the browser: put random, time- or `window`-dependent output
  in an effect or `<ClientOnly>`. The footer year comes from `__BUILD_YEAR__` (a Vite `define`) for
  this reason.
- **Content is data.** All resume text lives in `src/content/resume.ts`, typed by
  `src/content/types.ts`. Components in `src/components/resume/` only render it, and sections with
  empty arrays hide themselves. Content edits go in `resume.ts`, not in components.
- **Site switches** (`siteUrl`, `noindex`, `turnstileSiteKey`, `currentlyEmployed`, `appearance`)
  live in `src/config.ts`.
- **Cloudflare Worker.** `wrangler.jsonc` serves `dist/client` as static assets. The Worker script
  (`worker/index.ts`) runs only for `/api/*`; today that is just `POST /api/contact`. It has its own
  `tsconfig.json` (Workers types, no DOM) and is excluded from the root one. After changing bindings
  in `wrangler.jsonc`, regenerate `worker/worker-configuration.d.ts` with
  `pnpm wrangler types worker/worker-configuration.d.ts`.
- **Security headers** come from `public/_headers`, a template with a `__CSP_SCRIPT_HASHES__`
  placeholder. The CSP is strict (`default-src 'none'`). Any new external origin (script, image,
  font, fetch, frame) must be added to it, and the only one allowed today is
  `challenges.cloudflare.com` for Turnstile. Prefer self-hosting over adding origins.
- **Generated, committed assets.** `vp run favicons` and `vp run og-image` write the favicons,
  web manifest and `og-image.png` into `public/`. Re-run them after changing the name, first
  headline or location, and commit the output. The build doesn't run them.
- **`src/routeTree.gen.ts` is generated** by the TanStack Router plugin. Never edit it by hand.

## Look and feel (`src/appearance/`)

Other people will use this repo for their own resumes, so the look is configurable without code
changes. Two tiers, set in `appearance` in `src/config.ts`:

- `theme`: a named preset (`src/appearance/themes.ts`) choosing an option for every section. No
  theme means the default, `performative`, which is the original look; keep it that way.
- `sections`: per-section choices, each overriding the theme.

`resolveAppearance()` merges them into a complete `Appearance`. Components read their option with
`useAppearance("<section>")`; the context's default value is the site config, so the site needs
no provider, and Storybook wraps stories in one (toolbar theme switcher + `parameters.appearance`).

- **Everything is typed from one list**: `appearanceOptions` in `src/appearance/options.ts`.
  Invalid choices in the config are type errors, and each section maps every option to an
  implementation with `satisfies Record<AppearanceOption<"…">, …>`, so a new option can't be
  forgotten.
- **Palettes** are TypeScript values (`palettes.ts`), not CSS, because canvas backgrounds and the
  favicon/OG scripts need real colours. `paletteStyle()` turns one into `--pui-*` variables, set on
  `<html>` by `src/routes/__root.tsx` (prerendered, so no flash). Anything coloured must use the
  `--pui-grad-*` variables or the palette values, never hard-coded hex. Where performative-ui
  hard-codes its violet, `src/styles.css` overrides it.
- **Sections mark their root** with `data-section` and `data-variant` (`Section` takes a
  `variant` prop). Stories assert on these with `expectVariant()`.
- performative-ui's stylesheet is unlayered, so its rules beat Tailwind utilities on the same
  element (e.g. `.pui-ascii` keeps `position: relative` over `absolute`). Use inline styles or a
  wrapper element when you need to win.

**Adding an option** (test first, as always):

1. Add the name to its list in `options.ts`. `vp check` now fails where the section maps options to
   components.
2. Add a story with `parameters: { appearance: { <section>: "<option>" } }` and a `play` that calls
   `expectVariant()`. Run it red.
3. Implement it in the section's map. Colours from the palette only. Anything random or
   time-based must render client-side (`<ClientOnly>`) and be deterministic under the visual
   test's fake clocks; if it can't be, add its selector to `MASKED` (painted over) or `HIDDEN` (made
   invisible, layout kept) in `src/visual.browser.test.tsx`.
4. Record the screenshot (`vp run test:update-screenshots`) and look at it.
5. Optionally use it in a theme. **Adding a section** works the same way, but every theme must then
   choose an option for it (a type error until it does).

## Testing

### This project uses test-driven development

Write the test first, watch it fail, then write the code that makes it pass. This applies to every
behavior change and bug fix:

1. **Red.** Add or change a test that describes the new behavior or reproduces the bug. Run it
   (`vp test --project <name> <file>`) and confirm it fails for the expected reason, not because
   of a typo or a missing import.
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Tidy the code and the test, with `vp test` and `vp check` passing.

Pick the layer that matches the change:

- Worker logic, content rules, scripts: a `unit` test (`*.test.ts`).
- A new component, section or visible state: a story first. It fails until the component exists,
  and then gives a smoke test, an a11y check and a screenshot.
- Behavior a visitor triggers (opening the dialog, submitting the form): a story with a `play`
  function that asserts the outcome.
- A visual change: update the story if needed and run the screenshot test. It should fail and show
  the intended difference. Then accept it with `vp run test:update-screenshots`.

Content-only edits to `src/content/resume.ts` don't need a new test; the content checks in
`src/content/resume.test.ts` already cover them. Don't weaken or delete a failing test to get to
green. If a test is wrong, say so and change it on purpose.

### Test projects

`vp test` runs three Vitest projects, defined in `vite.config.ts` under `test.projects`:

| Project     | Runs                                  | What it checks                                                                               |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `unit`      | `**/*.test.ts` in Node                | The contact Worker (`worker/index.test.ts`), content sanity (`src/content/resume.test.ts`).  |
| `storybook` | every `*.stories.tsx`, in Chromium    | Each story renders, its `play` function passes, and axe finds no accessibility violations.   |
| `browser`   | `src/**/*.browser.test.tsx`, Chromium | Screenshot tests: `src/visual.browser.test.tsx` compares every story with a reference image. |

Run one with `vp test --project <name>`. Storybook itself: `vp run storybook` (port 6006).

- **Stories** live next to their component (`hero.stories.tsx`). Every component or state worth
  seeing gets one; it then gets a smoke test, an a11y check and a screenshot test for free. A11y
  violations fail the test (`a11y.test: "error"` in `.storybook/preview.tsx`); fix the cause rather
  than turning the rule off.
- **Stories never show the live resume.** Components get content from `useResume()`
  (`src/content/context.tsx`), whose default is the live `resume.ts`. Storybook provides
  `src/content/sample-resume.ts` instead: fictional, `example.*` links only, covering every case
  the components handle (`resume.test.ts` checks all three). So editing the real resume never
  changes a story or screenshot. Never import `@/content/resume` in a component; only the root
  route's page metadata uses it directly. When a component learns to show something new, extend
  the sample so a story shows it. Test fixtures elsewhere (Worker tests, the contact stories) use
  fictional names and `example.com` too.
- **Other states** come from props with config defaults, as `Hero`, `ExperienceSection` and
  `ResumePage` do with `currentlyEmployed`, or from `parameters.appearance`. Don't mutate the
  config in stories.
- **Storybook is dark-only, like the site.** `.storybook/theme.ts` themes the Docs pages
  (`parameters.docs.theme` in `preview.tsx`) and the Storybook UI (`manager.ts`) with the site's
  colours, whatever the OS setting. Tested in `.storybook/*.test.ts` (the `unit` project).
- **Nothing in tests may reach the network.** The contact stories install a Turnstile stub on
  `window.turnstile` (which `loadTurnstile` uses in preference to the script) and mock `fetch`
  with `spyOn`; the Worker tests stub `fetch` with `vi.stubGlobal`.
- **Screenshots.** Reference images are in `src/__screenshots__/` and are committed. After an
  intended visual change, run `vp run test:update-screenshots`, look at the new images, and commit
  them with the change. Never update them just to make a failing test pass without looking at the
  diff, which Vitest writes to `.vitest/attachments/` (gitignored). Images are per OS
  (`-chromium-win32.png`): font rendering differs, so a CI on Linux needs its own set, recorded
  there.
- **Keeping screenshots deterministic.** performative-ui animates with `requestAnimationFrame`,
  `setInterval`, `performance.now()` and `Math.random()`, mostly ignoring reduced motion. The
  visual test seeds `Math.random`, runs those clocks fake and fast-forwards them 2 s, renders each
  story once at its final viewport size before the real render, and disables CSS animations in the
  capture. Stories with a `play` function run on real clocks (Testing Library's `waitFor` needs
  them), so keep animated performative-ui components out of interactive stories. Read the comments
  in `src/visual.browser.test.tsx` before changing any of this; each step fixes a flake that was
  observed. Opt a story out of screenshots with `tags: ["!visual"]`.
- **The TanStack Start plugin is off in tests and Storybook** (`isTest` in `vite.config.ts`, and
  `viteFinal` in `.storybook/main.ts`), because stories render components without the router.
  `__BUILD_YEAR__` is pinned to 2026 under Vitest so the footer doesn't change the screenshots
  each January.
- **Vitest doesn't work in the Cloudflare Workers runtime.** `vite.config.ts` must omit the
  Cloudflare Vite plugin (`@cloudflare/vite-plugin`) when `process.env.VITEST` is set. Use the
  existing `isTest` flag, the same way the TanStack Start plugin is left out. The project doesn't
  use that plugin today (Wrangler builds and serves the Worker), so this applies if it's ever added.

### Conventions

- Import from `src/` with the `@/` alias (`@/components/...`, `@/config`).
- Import Vite+ APIs from `vite-plus`, not `vite` or `vitest`: test APIs from `vite-plus/test`,
  browser-mode APIs (`page`) from `vite-plus/test/browser/context`. The lint rule
  `vite-plus/prefer-vite-plus-imports` enforces this. In stories, use `storybook/test` (`expect`,
  `userEvent`, `spyOn`, `waitFor`).
- Lint runs type-aware with type checking, so `vp check` catches type errors too.
- Comments explain _why_ (constraints, gotchas), as in `vite.config.ts` and `wrangler.jsonc`. Keep
  that style.

## Dependencies and why they're here

### Runtime (shipped to the browser)

| Package                                                                                             | Why                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom`                                                                                | UI library.                                                                                                                                                            |
| `@tanstack/react-start`                                                                             | Full-stack framework; used here only for its Vite plugin's static prerendering of `/`.                                                                                 |
| `@tanstack/react-router`                                                                            | Routing, `<HeadContent>`/`<Scripts>` for meta tags, and `<ClientOnly>`. Pinned to an exact version to match `react-start`; upgrade the two together.                   |
| `performative-ui`                                                                                   | The flashy components (Aurora background, GradientText, StickyBanner, BigBack footer, FloatingSparkles…) and the dark `--pui-*` palette the whole site is themed from. |
| `radix-ui`                                                                                          | Accessible primitives behind the shadcn `dialog`, `tooltip` and `separator` components.                                                                                |
| `class-variance-authority`, `clsx`, `tailwind-merge`                                                | shadcn helpers: variant classes (`badge.tsx`) and `cn()` in `src/lib/utils.ts`.                                                                                        |
| `lucide-react`                                                                                      | Icons (the shadcn default icon set).                                                                                                                                   |
| `tailwindcss`, `@tailwindcss/vite`                                                                  | Styling. Tailwind v4, configured in CSS (`src/styles.css`); there is no `tailwind.config`.                                                                             |
| `tw-animate-css`                                                                                    | Enter/exit animation utilities the shadcn components use.                                                                                                              |
| `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`, `@fontsource/instrument-serif` | Self-hosted fonts, so there are no font CDN requests and the CSP can stay `font-src 'self'`.                                                                           |

### Development and build only

| Package                                                | Why                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `vite-plus`, `vite`                                    | Toolchain (dev server, build, lint, format, type check). Both versions come from the pnpm catalog.                  |
| `@vitejs/plugin-react`                                 | React support for Vite.                                                                                             |
| `typescript`, `@types/*`                               | Types for the app, the scripts and Node.                                                                            |
| `wrangler`                                             | Cloudflare CLI: local Workers runtime (`preview:worker`), deploys, secrets, `Env` type generation.                  |
| `@resvg/resvg-js`, `opentype.js`, `@types/opentype.js` | Used only by the favicon and OG image scripts: turn text into SVG paths and rasterise them to PNG.                  |
| `@fontsource/inter` (static)                           | Supplies the `.woff` files those scripts read. The variable font package doesn't ship the static weights they need. |

### Testing only

| Package                                    | Why                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest`                                   | Already bundled in `vite-plus`; listed directly because `@storybook/addon-vitest` imports it as a peer. Same exact version, so pnpm keeps one copy.                 |
| `@vitest/browser-playwright`, `playwright` | Vitest browser mode runs the `storybook` and `browser` projects in real Chromium through Playwright. `vite-plus` bundles the browser runtime but not this provider. |
| `storybook`, `@storybook/react-vite`       | Storybook 10 with the React + Vite framework. Builds on `vite.config.ts` (minus the TanStack plugin).                                                               |
| `@storybook/addon-vitest`                  | Turns every story into a Vitest test (the `storybook` project) and shows results in the Storybook UI.                                                               |
| `@storybook/addon-a11y`                    | axe accessibility checks, in the UI and as test failures.                                                                                                           |
| `@storybook/addon-docs`                    | Autodocs pages for components (every story is tagged `autodocs`).                                                                                                   |

### External services (not npm packages)

- **Cloudflare Workers**: hosting, static assets, custom domain, rate limiting (`CONTACT_RATE_LIMIT`).
- **Cloudflare Turnstile**: bot check on the contact form.
- **Resend**: sends contact form emails. Secrets are `CONTACT_TO`, `RESEND_API_KEY` and
  `TURNSTILE_SECRET_KEY`, set with `wrangler secret put` and, locally, in `.dev.vars`. Never commit
  them.

### Package manager

pnpm 12.16.1, pinned in `package.json` (`packageManager` and `devEngines`). `pnpm-workspace.yaml`
lists the only packages allowed to run install scripts (`esbuild`, `lightningcss`, `workerd`). Add
to that list only when a new dependency really needs a native build step.
