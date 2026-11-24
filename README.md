# resume-website

A prerendered resume site, served from a single Cloudflare Worker, built with [TanStack Start](https://tanstack.com/start) on
[Vite+](https://viteplus.dev), using [performative-ui](https://performative-ui.cncl.co/) components
plus a few [shadcn/ui](https://ui.shadcn.com) pieces.

> **Setting up your own copy, or editing your content?** Check
> [docs/getting-started.md](docs/getting-started.md) first. It covers accounts and keys, the
> software to install, editing `src/content/resume.ts` and `src/config.ts`, the generated images,
> local testing (including screenshot tests and the contact form), deployment with Cloudflare
> Workers Builds, and updating the site later. This README covers the rest.

## Open to work

When `currentlyEmployed` is `false`, the page shows an "open to new roles" banner, a green status pill
and a "Get in touch" button; the button and the banner's "Let's talk" link open the contact form.
When it is `true`, these are replaced by a pill naming your current role: the first `experience`
entry that has no `end` date.

## Look and feel

Choose a look in [`src/config.ts`](src/config.ts) → `appearance`:

```ts
const appearance: AppearanceConfig = {
  theme: "minimal", // performative (default) | minimal | network | terminal
  sections: { palette: "ocean", hero: "classic" }, // optional; each overrides the theme
};
```

| Section      | Options                                      |
| ------------ | -------------------------------------------- |
| `palette`    | `violet`, `ocean`, `ember`, `forest`, `mono` |
| `background` | `aurora`, `nodeGraph`, `ascii`, `plain`      |
| `hero`       | `classic`, `centered`                        |
| `headline`   | `wordRoll`, `typewriter`, `static`           |
| `banner`     | `sticky`, `none`                             |
| `experience` | `cards`, `timeline`                          |
| `skills`     | `strip`, `badges`                            |
| `projects`   | `cards`, `list`                              |
| `footer`     | `bigback`, `simple`                          |

The choices are type-checked, so your editor suggests them and `vp check` rejects a typo. Run
`vp run storybook` to see every option, and use the Theme menu in its toolbar to see each theme.
After changing the palette, run `vp run favicons` and `vp run og-image` so the icons and
link-preview image match.

## Commands

The package manager is pinned in `package.json` (`packageManager` / `devEngines`: pnpm 12.16.1).

```sh
vp install   # install dependencies
vp run dev   # dev server on http://localhost:3000
vp check     # format, lint and type-check
vp run build # production build → dist/client (also fills in the CSP hashes)
vp preview   # serve the production build locally
vp run favicons  # regenerate public/ favicons from your name (run after changing it)
vp run og-image  # regenerate the link-preview image (after changing name, headline or location)
vp run deploy    # build and deploy to Cloudflare Workers (your custom domain in wrangler.jsonc)
vp run preview:worker  # build and serve through the local Workers runtime, headers included
vp test          # unit, story and screenshot tests (see docs/getting-started.md, step 5)
vp run storybook # Storybook on http://localhost:6006
```

## Contact form

"Get in touch" and "Let's talk" open a dialog
([`src/components/resume/contact-dialog.tsx`](src/components/resume/contact-dialog.tsx)) that posts
to `POST /api/contact`, handled by [`worker/index.ts`](worker/index.ts). The Worker checks the
request comes from the site, rate-limits by IP (3 a minute), validates the fields, drops anything
that fills the hidden honeypot field, verifies a [Turnstile](https://developers.cloudflare.com/turnstile/)
token, and then emails the message to `CONTACT_TO` through [Resend](https://resend.com). Reply-To is
the sender, so you can answer from your mail client.

## Social previews and search

The root route ([`src/routes/__root.tsx`](src/routes/__root.tsx)) sets Open Graph and Twitter card
tags plus a canonical URL, built from `siteUrl` in [`src/config.ts`](src/config.ts). The preview
image, `public/og-image.png` (1200×630), is generated from your name, first headline and location
by `vp run og-image`. Re-run it after changing those, and commit the output.

The site is kept out of search results: `noindex` in `src/config.ts` adds a robots meta tag, and
`public/_headers` sends `X-Robots-Tag: noindex` for every file. `public/robots.txt` still allows
crawling, because preview bots such as LinkedInBot obey it. To allow indexing, remove both.

## Headers and 404s

- **Headers**: [`public/_headers`](public/_headers) sets the security headers (CSP, HSTS, framing,
  referrer, permissions) and a one-year immutable cache for `/assets/*`. The CSP allows the page's
  inline scripts by hash; `scripts/write-csp.ts` computes those hashes after each build. Plain
  `vp build` skips that step, so always build with `vp run build`.
- **404s**: unknown URLs get [`public/404.html`](public/404.html) with a real 404 status. The root
  route's `notFoundComponent` covers the rare case of an unknown path reached by client-side
  navigation.

## How it's built

- **Static prerendering** (`vite.config.ts`): the build renders `/` to a complete
  `dist/client/index.html`, so the resume text is in the HTML (for link previews, bots and a fast
  first paint) and React hydrates it in the browser. Anything rendered must come out the same at
  build time and in the browser, or React logs a hydration error. Put random, time- or
  `window`-dependent output in an effect or TanStack's `<ClientOnly>`, as the hero does for
  performative-ui's `FloatingSparkles`. The footer year is fixed at build time (`__BUILD_YEAR__`),
  so it updates on the first deploy of a new year. The only server code is the contact form API in
  [`worker/`](worker/), which has its own `tsconfig.json` (Workers runtime types, no DOM).
- **Fonts** are self-hosted through `@fontsource`, so the site makes no requests to font CDNs.
- **Styling**: performative-ui's dark `--pui-*` palette is mapped onto the shadcn theme tokens in
  [`src/styles.css`](src/styles.css), so both component sets match.
- Page sections live in [`src/components/resume/`](src/components/resume/) and shadcn primitives in
  [`src/components/ui/`](src/components/ui/). Add more shadcn components with
  `pnpm dlx shadcn@latest add <name>`.
