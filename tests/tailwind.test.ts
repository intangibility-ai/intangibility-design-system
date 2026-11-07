import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { compile } from '@tailwindcss/node';

test('Tailwind v4 compiles named palette and scoped typography utilities', async () => {
  const theme = await readFile(
    new URL('../styles/theme.css', import.meta.url),
    'utf8',
  );
  const fonts = await readFile(
    new URL('../styles/fonts.css', import.meta.url),
    'utf8',
  );
  const compiler = await compile(`@import "tailwindcss";\n${fonts}\n${theme}`, {
    base: process.cwd(),
    onDependency() {},
  });
  const css = compiler.build([
    'bg-app-canvas',
    'text-app-ink',
    'bg-riso-paper',
    'text-riso-ink',
    'bg-canvas',
    'font-display',
    'font-body',
    'font-mono',
    'text-body',
    'leading-body',
    'font-black',
    'rounded-control',
  ]);
  for (const selector of [
    '.bg-app-canvas',
    '.text-app-ink',
    '.bg-riso-paper',
    '.text-riso-ink',
    '.bg-canvas',
    '.font-display',
    '.font-body',
    '.font-mono',
    '.text-body',
    '.leading-body',
    '.font-black',
    '.rounded-control',
  ])
    assert.ok(css.includes(selector), `Missing ${selector}`);
  assert.match(css, /background-color: var\(--ds-color-canvas\)/);
  assert.match(css, /font-family: var\(--ds-font-display\)/);
  assert.match(css, /font-size: var\(--ds-text-body\)/);
  assert.match(css, /@font-face/);
  assert.match(css, /font-family: 'Big Shoulders Display'/);
  assert.match(css, /font-family: 'Archivo'/);
  assert.match(css, /font-family: 'Spline Sans Mono'/);
});
