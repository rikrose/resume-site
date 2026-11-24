/**
 * Generates public/og-image.png, the 1200×630 link-preview image used by the
 * Open Graph and Twitter card tags, from src/content/resume.ts.
 *
 *   vp run og-image
 *
 * Re-run it when your name, first headline or location changes. Like the
 * favicons, the output is committed, so the build doesn't depend on it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";

import { siteConfig } from "../src/config.ts";
import { resume } from "../src/content/resume.ts";
import { brandGradient } from "./brand.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "public", "og-image.png");
const require = createRequire(import.meta.url);

const W = 1200;
const H = 630;
const PAD = 80;

// Background tones match performative-ui's --pui-* tokens; the gradient is
// the palette chosen in src/config.ts (scripts/brand.ts).
const BG = "#08080b";
const FG = "#f4f4f6";
const FG_DIM = "#a3a3b2";
const BORDER = "#1f1f2b";
const GRAD = brandGradient;

function loadFont(weight: number) {
  const bytes = readFileSync(
    require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`),
  );
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
const heavy = loadFont(800);
const medium = loadFont(500);
const regular = loadFont(400);

/**
 * Text as an SVG path, laid out glyph by glyph (opentype.js's shaper chokes
 * on Inter's GSUB table; kerning pairs are applied by hand). `tracking` is
 * extra space between letters in em.
 */
function text(
  font: opentype.Font,
  str: string,
  { x, y, size, tracking = 0 }: { x: number; y: number; size: number; tracking?: number },
) {
  const path = new opentype.Path();
  const unit = size / font.unitsPerEm;
  let pen = x;
  let prev: opentype.Glyph | undefined;
  for (const ch of str) {
    const glyph = font.charToGlyph(ch);
    if (prev) pen += font.getKerningValue(prev, glyph) * unit;
    path.extend(glyph.getPath(pen, y, size));
    pen += (glyph.advanceWidth ?? 0) * unit + tracking * size;
    prev = glyph;
  }
  return { d: path.toPathData(2), width: pen - x };
}

/** Largest size ≤ `max` at which `str` fits in `maxWidth`. */
function fit(font: opentype.Font, str: string, max: number, maxWidth: number, tracking = 0) {
  const width = text(font, str, { x: 0, y: 0, size: 100, tracking }).width;
  return Math.min(max, (100 * maxWidth) / width);
}

const contentWidth = W - PAD * 2;
const host = new URL(siteConfig.siteUrl).host;
const headline = resume.headlines[0] ?? "Resume";

const nameSize = fit(heavy, resume.name, 132, contentWidth, -0.02);
const headlineSize = fit(medium, headline, 52, contentWidth);

const eyebrow = text(regular, "RESUME", { x: PAD, y: 150, size: 24, tracking: 0.3 });
const name = text(heavy, resume.name, { x: PAD, y: 330, size: nameSize, tracking: -0.02 });
const role = text(medium, headline, { x: PAD, y: 330 + headlineSize * 1.7, size: headlineSize });
const footer = text(regular, [resume.location, host].filter(Boolean).join("  ·  "), {
  x: PAD,
  y: H - PAD,
  size: 28,
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${GRAD[0]}"/>
      <stop offset="0.55" stop-color="${GRAD[1]}"/>
      <stop offset="1" stop-color="${GRAD[2]}"/>
    </linearGradient>
    <linearGradient id="nameGrad" gradientUnits="userSpaceOnUse" x1="${PAD}" y1="0" x2="${PAD + name.width}" y2="0">
      <stop offset="0" stop-color="${GRAD[0]}"/>
      <stop offset="0.55" stop-color="${GRAD[1]}"/>
      <stop offset="1" stop-color="${GRAD[2]}"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.15" cy="0" r="0.75">
      <stop offset="0" stop-color="${GRAD[0]}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${GRAD[0]}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.95" cy="1" r="0.6">
      <stop offset="0" stop-color="${GRAD[2]}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${GRAD[2]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glowA)"/>
  <rect width="${W}" height="${H}" fill="url(#glowB)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="url(#g)"/>
  <path d="${eyebrow.d}" fill="${FG_DIM}"/>
  <rect x="${PAD + eyebrow.width + 20}" y="140" width="${W - PAD * 2 - eyebrow.width - 20}" height="2" fill="${BORDER}"/>
  <path d="${name.d}" fill="url(#nameGrad)"/>
  <path d="${role.d}" fill="${FG}"/>
  <path d="${footer.d}" fill="${FG_DIM}"/>
</svg>
`;

const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
writeFileSync(outFile, png);
console.log(`  public/og-image.png (${W}×${H}, ${Math.round(png.length / 1024)} KB)`);
