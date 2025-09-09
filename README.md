# FLU

Flu is a tiny, dependency‑free, chainable terminal styling library.

- Chainable styles, nested styling support, multiple args
- Full 16/bright colors, background colors, modifiers
- RGB and HEX truecolor support
- Simple plugin API to add custom styles

## Install

```bash
npm install @invboyz/flu
```

## Quick Start

```ts
// ESM/TypeScript
import flu from '@invboyz/flu';

// CommonJS
const flu = require('@invboyz/flu');

console.log(flu.blue('Hello world!'));

// Combine styled and normal strings
console.log(flu.blue('Hello') + ' World' + flu.red('!'));

// Chain styles
console.log(flu.blue.bgRed.bold('Hello world!'));

// Multiple arguments
console.log(flu.blue('Hello', 'World!', 'Foo', 'bar', 'biz', 'baz'));

// Nest styles
console.log(flu.red('Hello', flu.underline.bgBlue('world') + '!'));

// Nest same-type styles
console.log(
  flu.green(
    'I am a green line ' +
    flu.blue.underline.bold('with a blue substring') +
    ' that becomes green again!'
  )
);

// Template literal
console.log(`
CPU: ${flu.red('90%')}
RAM: ${flu.green('40%')}
DISK: ${flu.yellow('70%')}
`);

// Truecolor
console.log(flu.rgb(123, 45, 67).underline('Underlined reddish color'));
console.log(flu.hex('#DEADED').bold('Bold gray!'));
```

## API

- Callables: every style builder is callable: `flu.blue('text')`
- Chainable: `flu.red.bold.underline('text')`
- Nesting safe: inner style closes are restored automatically
- Multiple arguments: `flu.cyan('a', 1, true)` → `a 1 true`

### Colors (foreground)

- Basic: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`/`grey`
- Bright: `blackBright`, `redBright`, `greenBright`, `yellowBright`, `blueBright`, `magentaBright`, `cyanBright`, `whiteBright`

### Background colors

- Basic: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`, `bgGray`/`bgGrey`
- Bright: `bgBlackBright`, `bgRedBright`, `bgGreenBright`, `bgYellowBright`, `bgBlueBright`, `bgMagentaBright`, `bgCyanBright`, `bgWhiteBright`

### Modifiers

- `reset`, `bold`, `dim`, `italic`, `underline`, `inverse`, `hidden`, `strikethrough`

### Truecolor

- `rgb(r, g, b)` – 0..255
- `bgRgb(r, g, b)`
- `hex('#RRGGBB' | '#RGB')`
- `bgHex('#RRGGBB' | '#RGB')`

## Plugin API

Extend Flu at runtime with custom styles (and extend the types via module augmentation if desired).

```ts
import flu from '@invboyz/flu';

// 1) Register a simple open/close style
flu.registerStyle('frame', '\u001B[51m', '\u001B[54m');
console.log(flu.frame('framed!'));

// 2) Register a dynamic style
flu.registerDynamicStyle('hsl', (h: number, s: number, l: number) => {
  // convert to RGB (demo: fake; plug your conversion)
  const [r, g, b] = [h % 255, s % 255, l % 255];
  return { open: `\u001B[38;2;${r};${g};${b}m`, close: '\u001B[39m' };
});
console.log(flu.hsl(200, 60, 50)('ocean'));

// 3) Bulk extend with a record
flu.extend({
  shout: { open: '\u001B[1m', close: '\u001B[22m' },
});
console.log(flu.shout('LOUD'));
```

TypeScript users can augment the `Flu` interface in their project to get strong typing for custom styles:

```ts
// globals.d.ts (in your app)
declare module 'flu' {
  interface Flu {
    frame: Flu;
    hsl(h: number, s: number, l: number): Flu;
    shout: Flu;
  }
}
```

## Design

- No dependencies; ANSI codes are defined in small constants
- Chainable builder implemented with a Proxy that collects styles
- Nesting is handled by reopening after close codes inside strings
- Extensible registry for styles and dynamic factories

## Notes

- Output relies on ANSI escape sequences; ensure your terminal supports them
- Truecolor (`rgb`/`hex`) requires a 24-bit color terminal

