/**
 * Post-build step: writes dist/client/_headers from the public/_headers
 * template, filling in the Content-Security-Policy script hashes.
 *
 * TanStack Start writes a few inline <script> tags into the prerendered
 * index.html (scroll restoration and router bootstrap). Their contents change
 * between builds, so this script hashes each one and replaces the
 * __CSP_SCRIPT_HASHES__ placeholder with the hash list. It always starts from
 * the template, so it is safe to run again (e.g. when `vp run` replays a
 * cached build), and it exits with an error rather than leave a broken policy
 * behind.
 *
 * Runs as part of the package `build` script, which Wrangler calls before every
 * `deploy` and `dev` (see wrangler.jsonc).
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const templatePath = join(root, "public", "_headers");
const outDir = join(root, "dist", "client");
const htmlPath = join(outDir, "index.html");
const headersPath = join(outDir, "_headers");
const placeholder = "__CSP_SCRIPT_HASHES__";

const html = readFileSync(htmlPath, "utf8");
const headers = readFileSync(templatePath, "utf8");

if (!headers.includes(placeholder)) {
  throw new Error(`${templatePath} has no ${placeholder} placeholder`);
}

// Inline scripts only: tags without a src attribute.
const inlineScript = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
const hashes = new Set<string>();
for (const [, body] of html.matchAll(inlineScript)) {
  if (!body) continue;
  hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
}

if (hashes.size === 0) {
  throw new Error(`No inline scripts found in ${htmlPath}; check the build output`);
}

writeFileSync(headersPath, headers.replaceAll(placeholder, [...hashes].join(" ")));
console.log(`[csp] wrote ${hashes.size} script hash(es) to dist/client/_headers`);
