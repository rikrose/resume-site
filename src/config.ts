import type { AppearanceConfig } from "./appearance/options";

/**
 * Look and feel. Pick a `theme` (performative, minimal, network, terminal;
 * leave it out for "performative", the original look), then override any
 * section in `sections`. Your editor lists the valid choices for each;
 * src/appearance/options.ts has them all, src/appearance/themes.ts what each
 * theme picks. Run `vp run storybook` to see them all side by side.
 *
 *   appearance: { theme: "minimal", sections: { hero: "classic", palette: "ocean" } }
 */
const appearance: AppearanceConfig = {
  theme: "performative",
};

/**
 * Site-wide switches. Flip these and rebuild — no other code changes needed.
 */
export const siteConfig = {
  /** Public origin, no trailing slash. Used for canonical and Open Graph URLs. */
  siteUrl: "https://resume.example.com",

  /**
   * Keep the site out of search results. Adds a `noindex` robots meta tag
   * (public/_headers sets the matching X-Robots-Tag header for every file).
   * Crawling stays allowed, so LinkedIn, Slack etc. can still build previews.
   */
  noindex: true,

  /**
   * Public site key of the Turnstile widget that protects the contact form
   * (Cloudflare dashboard → Turnstile; add your resume hostname, e.g. resume.example.com).
   * The matching secret is the Worker's TURNSTILE_SECRET_KEY secret.
   * The placeholder is Turnstile's "always passes" test key, which pairs with
   * the test secret in .dev.vars.example. Replace it with your own before deploying.
   */
  turnstileSiteKey: "1x00000000000000000000AA",

  /**
   * Am I currently employed?
   *
   * - `true`: the page shows where you currently work (the first
   *   `experience` entry without an `end` date) and drops the "hire me" CTA.
   * - `false`: the page shows an "open to work" banner, a green status pill
   *   and a prominent contact button.
   */
  currentlyEmployed: false,

  appearance,
} as const;
