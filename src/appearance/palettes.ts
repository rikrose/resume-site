import type { CSSProperties } from "react";

import type { AppearanceOption } from "./options";

interface Palette {
  /** Main accent: gradient start, primary buttons, focus rings, glows. */
  from: string;
  /** Gradient middle; also the second glow colour. */
  mid: string;
  /** Gradient end. */
  to: string;
  /** Text colour on a solid `from` background. */
  onAccent: string;
}

/**
 * Accent colours, kept in TypeScript (not CSS) because canvas backgrounds and
 * the favicon/OG-image scripts need the actual values, not CSS variables.
 * Everything else picks them up through the --pui-* variables set by
 * `paletteStyle`. The background is dark in every palette.
 */
export const palettes = {
  // performative-ui's own palette, so the default theme looks as it always has.
  violet: { from: "#7c3aed", mid: "#ec4899", to: "#06b6d4", onAccent: "#ffffff" },
  ocean: { from: "#38bdf8", mid: "#6366f1", to: "#2dd4bf", onAccent: "#04121c" },
  ember: { from: "#f97316", mid: "#ef4444", to: "#facc15", onAccent: "#1c0a02" },
  forest: { from: "#22c55e", mid: "#10b981", to: "#a3e635", onAccent: "#03140a" },
  mono: { from: "#d4d4d8", mid: "#a1a1aa", to: "#f4f4f5", onAccent: "#09090b" },
} as const satisfies Record<AppearanceOption<"palette">, Palette>;

export type PaletteName = keyof typeof palettes;

/** "#7c3aed", 0.45 → "rgba(124,58,237,0.45)". */
export function rgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * CSS variables that recolour performative-ui and the shadcn tokens mapped
 * onto it (src/styles.css). Set on <html> by the root route, and on the story
 * wrapper in Storybook.
 */
export function paletteStyle(name: PaletteName): CSSProperties {
  const p = palettes[name];
  return {
    "--pui-grad-from": p.from,
    "--pui-grad-mid": p.mid,
    "--pui-grad-to": p.to,
    "--pui-glow": `0 0 24px ${rgba(p.from, 0.45)}`,
    "--pui-glow-strong": `0 0 48px ${rgba(p.from, 0.55)}, 0 0 96px ${rgba(p.mid, 0.25)}`,
    "--primary-foreground": p.onAccent,
  } as CSSProperties;
}

/** Aurora's three colour blobs, laid out as performative-ui's defaults. */
export function auroraBlobs(name: PaletteName) {
  const p = palettes[name];
  return [
    { color: rgba(p.from, 0.45), x: 20, y: 30, size: 60 },
    { color: rgba(p.mid, 0.35), x: 80, y: 25, size: 50 },
    { color: rgba(p.to, 0.3), x: 50, y: 80, size: 50 },
  ];
}
