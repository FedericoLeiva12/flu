/**
 * @license ISC
 * Copyright (c) 2025 Federico Leiva
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import { BASE_COLORS, BG_BASE, BG_BRIGHT_BASE, BG_CLOSE, FG_BASE, FG_BRIGHT_BASE, FG_CLOSE, code } from "./constants.js";
import { Style, applyStyles, capitalize, joinArgs, parseHex, truecolor } from "./utils.js";

/**
 * Factory that returns a style based on runtime parameters
 * (e.g., rgb, hex).
 */
export type StyleFactory = (...args: any[]) => Style;

/**
 * Internal registry of static and dynamic styles used by the proxy
 * builder to resolve properties at access time.
 */
type Registry = {
  styles: Record<string, Style>;
  dynamics: Record<string, StyleFactory>;
};

// Modifiers
/**
 * Built-in modifier styles (bold, underline, etc.).
 */
const modifierCodes: Record<string, Style> = {
  reset: { open: code(0), close: code(0) },
  bold: { open: code(1), close: code(22) },
  dim: { open: code(2), close: code(22) },
  italic: { open: code(3), close: code(23) },
  underline: { open: code(4), close: code(24) },
  inverse: { open: code(7), close: code(27) },
  hidden: { open: code(8), close: code(28) },
  strikethrough: { open: code(9), close: code(29) },
};

// Builder & Proxy machinery
/**
 * The callable target for our Proxy. It collects styles in __styles
 * and applies them when the function is invoked.
 */
interface BuilderTarget {
  (...text: unknown[]): string;
  __styles: Style[];
}

/** Methods that generate styles dynamically (truecolor). */
type BuiltInDynamics = {
  rgb: (r: number, g: number, b: number) => Flu;
  bgRgb: (r: number, g: number, b: number) => Flu;
  hex: (hex: string) => Flu;
  bgHex: (hex: string) => Flu;
};

/** Chainable modifier properties available on `flu`. */
type BuiltInModifiers = {
  reset: Flu;
  bold: Flu;
  dim: Flu;
  italic: Flu;
  underline: Flu;
  inverse: Flu;
  hidden: Flu;
  strikethrough: Flu;
};

/** Chainable color and background properties available on `flu`. */
type BuiltInColors = {
  blackBright: Flu;
  black: Flu;
  red: Flu;
  green: Flu;
  yellow: Flu;
  blue: Flu;
  magenta: Flu;
  cyan: Flu;
  white: Flu;
  gray: Flu;
  grey: Flu;
  redBright: Flu;
  greenBright: Flu;
  yellowBright: Flu;
  blueBright: Flu;
  magentaBright: Flu;
  cyanBright: Flu;
  whiteBright: Flu;
  bgBlack: Flu;
  bgRed: Flu;
  bgGreen: Flu;
  bgYellow: Flu;
  bgBlue: Flu;
  bgMagenta: Flu;
  bgCyan: Flu;
  bgWhite: Flu;
  bgGray: Flu;
  bgGrey: Flu;
  bgRedBright: Flu;
  bgGreenBright: Flu;
  bgYellowBright: Flu;
  bgBlueBright: Flu;
  bgMagentaBright: Flu;
  bgCyanBright: Flu;
  bgWhiteBright: Flu;
};

/**
 * Public plugin API exposed on the `flu` instance.
 */
type PluginAPI = {
  registerStyle: (name: string, open: string, close: string) => void;
  registerDynamicStyle: (name: string, factory: StyleFactory) => void;
  extend: (styles: Record<string, Style> | Record<string, StyleFactory>) => void;
};

/**
 * The `flu` interface is a callable that renders styled strings and also
 * exposes chainable properties for styles and the plugin API.
 */
export type Flu = ((...text: unknown[]) => string) &
  BuiltInModifiers &
  BuiltInColors &
  BuiltInDynamics &
  PluginAPI;

/**
 * Create the initial registry with built-in modifiers, colors,
 * bright variants, backgrounds, and dynamic truecolor factories.
 */
function createDefaultRegistry(): Registry {
  const styles: Record<string, Style> = { ...modifierCodes };

  // Foreground and bright variants
  BASE_COLORS.forEach((name, i) => {
    styles[name] = { open: code(FG_BASE + i), close: FG_CLOSE };
    const brightName = `${name}Bright`;
    const brightCode = FG_BRIGHT_BASE + i;
    styles[brightName] = { open: code(brightCode), close: FG_CLOSE };

    const bgName = `bg${capitalize(name)}`;
    styles[bgName] = { open: code(BG_BASE + i), close: BG_CLOSE };

    const bgBrightName = `bg${capitalize(name)}Bright`;
    const bgBrightCode = BG_BRIGHT_BASE + i;
    styles[bgBrightName] = { open: code(bgBrightCode), close: BG_CLOSE };
  });

  // gray/grey alias
  styles.gray = styles.grey = { open: code(FG_BRIGHT_BASE), close: FG_CLOSE };
  styles.bgGray = styles.bgGrey = { open: code(BG_BRIGHT_BASE), close: BG_CLOSE };

  const dynamics: Record<string, StyleFactory> = {
    rgb: (r: number, g: number, b: number) => truecolor(38, r, g, b),
    bgRgb: (r: number, g: number, b: number) => truecolor(48, r, g, b),
    hex: (h: string) => {
      const [r, g, b] = parseHex(h);
      return truecolor(38, r, g, b);
    },
    bgHex: (h: string) => {
      const [r, g, b] = parseHex(h);
      return truecolor(48, r, g, b);
    },
  };

  return { styles, dynamics };
}

/**
 * Create a new `flu` instance. The returned object is a Proxy-based builder
 * that collects styles via property access and applies them when called.
 */
export function createFlu(): Flu {
  const registry = createDefaultRegistry();

  /** Create a new builder with an accumulated list of styles. */
  const create = (styles: Style[]): Flu => {
    const target: BuilderTarget = Object.assign(
      (...text: unknown[]) => applyStyles(joinArgs(text), styles),
      { __styles: styles }
    ) as BuilderTarget;

    const handler: ProxyHandler<any> = {
      /**
       * When the builder is invoked like a function, render the provided
       * arguments with the accumulated styles.
       */
      apply(_t, _thisArg, argArray: unknown[]) {
        return applyStyles(joinArgs(argArray), styles);
      },
      /**
       * Property access drives the fluent API:
       * - Known style name => returns a new chained builder
       * - Known dynamic name => returns a function that yields a builder
       * - Plugin API methods => modify the registry
       */
      get(_t, prop: PropertyKey) {
        if (prop === "registerStyle") {
          return (name: string, open: string, close: string) => {
            registry.styles[name] = { open, close };
          };
        }
        if (prop === "registerDynamicStyle") {
          return (name: string, factory: StyleFactory) => {
            registry.dynamics[name] = factory;
          };
        }
        if (prop === "extend") {
          return (defs: Record<string, Style> | Record<string, StyleFactory>) => {
            for (const [k, v] of Object.entries(defs)) {
              if (typeof v === "function") registry.dynamics[k] = v as StyleFactory;
              else registry.styles[k] = v as Style;
            }
          };
        }

        if (typeof prop === "string") {
          if (registry.styles[prop]) {
            const st = registry.styles[prop];
            return create([...styles, st]);
          }
          if (registry.dynamics[prop]) {
            return (...args: any[]) => create([...styles, registry.dynamics[prop](...args)]);
          }
        }

        if (prop === Symbol.toPrimitive) {
          return () => applyStyles("", styles);
        }

        return undefined;
      },
    };

    return new Proxy(target as unknown as Flu, handler);
  };

  return create([]);
}
