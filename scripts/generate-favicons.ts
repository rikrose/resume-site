/**
 * Generates the favicon set in /public from the name in src/content/resume.ts.
 *
 *   pnpm favicons
 *
 * Re-run it whenever your name changes. The output is committed, so the
 * deployed site needs nothing at build time.
 *
 * Output:
 *   favicon.ico            16/32/48 px, for legacy browsers and tools
 *   favicon.svg            scalable icon, used by modern browsers
 *   apple-touch-icon.png   180 px, iOS home screen (full-bleed; iOS rounds it)
 *   icon-192.png           PWA / Android
 *   icon-512.png           PWA / Android
 *   icon-maskable-512.png  Android adaptive icon (glyph inside the safe zone)
 *   site.webmanifest       references the PNG icons
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";

import { resume } from "../src/content/resume.ts";
import { brandGradient } from "./brand.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");
const require = createRequire(import.meta.url);

// Background tones match performative-ui's --pui-* tokens; the gradient is
// the palette chosen in src/config.ts (scripts/brand.ts).
const BG = "#0e0e13";
const BORDER = "#2a2a3a";
const GRAD = brandGradient;
const THEME = "#08080b";

const initials = resume.name
  .split(/\s+/)
  .filter(Boolean)
  .map((w) => w[0]!.toUpperCase())
  .filter((_, i, all) => i === 0 || i === all.length - 1)
  .join("");

const fontFile = require.resolve("@fontsource/inter/files/inter-latin-800-normal.woff");
const fontBytes = readFileSync(fontFile);
const font = opentype.parse(
  fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength),
);

/**
 * Lay out the initials glyph by glyph (no shaping needed for a few capitals;
 * opentype.js's shaper also chokes on Inter's GSUB table).
 */
function layout(x: number, y: number, fontSize: number) {
  const path = new opentype.Path();
  const unit = fontSize / font.unitsPerEm;
  let pen = x;
  for (const ch of initials) {
    const glyph = font.charToGlyph(ch);
    path.extend(glyph.getPath(pen, y, fontSize));
    pen += (glyph.advanceWidth ?? 0) * unit - fontSize * 0.04; // slight tightening
  }
  return path;
}

/** Initials as a path centred in a `size` box, filling `scale` of its width. */
function glyphPath(size: number, scale: number): string {
  const b = layout(0, 0, 100).getBoundingBox();
  const fontSize = (100 * (size * scale)) / Math.max(b.x2 - b.x1, (b.y2 - b.y1) * 1.15);
  const bb = layout(0, 0, fontSize).getBoundingBox();
  const dx = (size - (bb.x2 - bb.x1)) / 2 - bb.x1;
  const dy = (size - (bb.y2 - bb.y1)) / 2 - bb.y1;
  // Numeric form = 2 decimal places, no y-flip (the object form flips by default).
  return layout(dx, dy, fontSize).toPathData(2);
}

/**
 * @param rounded  rounded tile with a hairline border (browser tab icons);
 *                 false = full-bleed square (OS applies its own mask).
 * @param scale    share of the tile width the initials occupy.
 */
function svg({ rounded, scale }: { rounded: boolean; scale: number }): string {
  const S = 512;
  const r = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GRAD[0]}"/>
      <stop offset="0.55" stop-color="${GRAD[1]}"/>
      <stop offset="1" stop-color="${GRAD[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.25" cy="0.15" r="0.9">
      <stop offset="0" stop-color="${GRAD[0]}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${GRAD[0]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${S}" height="${S}" rx="${r}" fill="${BG}"/>
  <rect width="${S}" height="${S}" rx="${r}" fill="url(#glow)"/>
  ${rounded ? `<rect x="6" y="6" width="${S - 12}" height="${S - 12}" rx="${r - 6}" fill="none" stroke="${BORDER}" stroke-width="12"/>` : ""}
  <path d="${glyphPath(S, scale)}" fill="url(#g)"/>
</svg>
`;
}

function png(source: string, size: number): Buffer {
  return new Resvg(source, { fitTo: { mode: "width", value: size } }).render().asPng();
}

/** ICO container holding PNG-encoded images (supported by all modern consumers). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

mkdirSync(outDir, { recursive: true });
const write = (name: string, data: string | Buffer) => {
  writeFileSync(join(outDir, name), data);
  console.log(`  public/${name}`);
};

const tab = svg({ rounded: true, scale: 0.62 });
const bleed = svg({ rounded: false, scale: 0.6 });
const maskable = svg({ rounded: false, scale: 0.48 }); // keep inside the 80% safe zone

console.log(`Favicons for "${resume.name}" (${initials}):`);
write("favicon.svg", tab);
write("favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: png(tab, size) }))));
write("apple-touch-icon.png", png(bleed, 180));
write("icon-192.png", png(tab, 192));
write("icon-512.png", png(tab, 512));
write("icon-maskable-512.png", png(maskable, 512));
write(
  "site.webmanifest",
  JSON.stringify(
    {
      name: resume.name,
      short_name: resume.name,
      description: resume.summary,
      start_url: "/",
      display: "standalone",
      background_color: THEME,
      theme_color: THEME,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    null,
    2,
  ) + "\n",
);
