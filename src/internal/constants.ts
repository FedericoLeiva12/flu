/**
 * @license ISC
 * Copyright (c) 2025 Federico Leiva
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
/**
 * ANSI escape introducer. Most control sequences begin with ESC + '['.
 */
export const ESC = "\u001B[";

/**
 * Build an ANSI SGR code (Select Graphic Rendition), e.g. code(31) => red.
 */
export const code = (n: number) => `${ESC}${n}m`;

/** Base foreground color range (30-37). */
export const FG_BASE = 30; // 30-37
/** Base background color range (40-47). */
export const BG_BASE = 40; // 40-47
/** Bright foreground color range (90-97). */
export const FG_BRIGHT_BASE = 90; // 90-97
/** Bright background color range (100-107). */
export const BG_BRIGHT_BASE = 100; // 100-107

/** Reset foreground color to default. */
export const FG_CLOSE = code(39);
/** Reset background color to default. */
export const BG_CLOSE = code(49);

/** Ordered list of the 8 standard ANSI colors. */
export const BASE_COLORS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
] as const;
