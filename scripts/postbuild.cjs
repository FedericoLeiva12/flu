/**
 * @license ISC
 * Copyright (c) 2025 Federico Leiva
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 Postbuild script to produce a CommonJS-friendly entry that sets
 module.exports to the default export function and attaches named exports.
*/
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const cjsBuild = path.join(__dirname, '..', 'dist-cjs', 'index.js');
const cjsImpl = path.join(distDir, 'index.cjs.js');
const cjsEntry = path.join(distDir, 'index.cjs');

// Ensure dist exists
fs.mkdirSync(distDir, { recursive: true });

// Copy compiled CJS impl to a non-conflicting filename inside dist
fs.copyFileSync(cjsBuild, cjsImpl);

// Write the wrapper that exports the default as module.exports
const wrapper = "'use strict';\n" +
  "const mod = require('./index.cjs.js');\n" +
  "const d = mod && mod.__esModule ? mod.default : mod;\n" +
  "module.exports = d;\n" +
  "// Re-expose named exports on the function for destructuring\n" +
  "if (mod) {\n" +
  "  for (const k of Object.keys(mod)) {\n" +
  "    if (k !== 'default') module.exports[k] = mod[k];\n" +
  "  }\n" +
  "}\n";

fs.writeFileSync(cjsEntry, wrapper);

console.log('CJS entry generated at', cjsEntry);

