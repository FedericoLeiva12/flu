/**
 * @license ISC
 * Copyright (c) 2025 Federico Leiva
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import { BG_CLOSE, ESC, FG_CLOSE } from "./constants.js";

/**
 * A pair of ANSI sequences that open and close a style.
 */
export type Style = { open: string; close: string };

/**
 * Clamp a number into the 0..255 byte range, flooring decimals.
 */
export function clamp255(n: number): number {
  n = Number(n);
  if (Number.isNaN(n)) return 0;
  return Math.min(255, Math.max(0, Math.floor(n)));
}

/**
 * Parse a hex color string (#RGB or #RRGGBB) into [r,g,b].
 * Throws on invalid input.
 */
export function parseHex(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/u, "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

/**
 * Build a truecolor (24-bit) style. `openBase` is 38 (fg) or 48 (bg).
 */
export function truecolor(openBase: 38 | 48, r: number, g: number, b: number): Style {
  const R = clamp255(r), G = clamp255(g), B = clamp255(b);
  const open = `${ESC}${openBase};2;${R};${G};${B}m`;
  const close = openBase === 38 ? FG_CLOSE : BG_CLOSE;
  return { open, close };
}

/**
 * Apply a list of styles to a text, preserving nested segments by
 * reopening styles after encountering their close sequences.
 */
export function applyStyles(text: string, styles: Style[]): string {
  if (styles.length === 0 || text.length === 0) return text;
  let out = text;
  for (const s of styles) {
    const pattern = new RegExp(escapeRegExp(s.close), "g");
    out = s.open + out.replace(pattern, s.close + s.open) + s.close;
  }
  return out;
}

/**
 * Convert an array of arguments to a space-separated string.
 */
export function joinArgs(args: unknown[]): string {
  return args.map((a) => String(a)).join(" ");
}

/**
 * Escape a string to be used as a literal in a RegExp.
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Uppercase the first character of a string.
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
