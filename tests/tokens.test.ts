import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';
import {
  flattenTokens,
  renderTheme,
  resolvedTokens,
  resolveTokens,
  tokens,
} from '../src/index';

test('committed CSS is byte-for-byte current', async () => {
  assert.equal(
    await readFile(new URL('../styles/theme.css', import.meta.url), 'utf8'),
    renderTheme(tokens),
    'Run pnpm generate and commit styles/theme.css',
  );
});

test('named tiers keep their product values and fixed typography', () => {
  const expected = {
    'color.app.canvas': '#ffffff',
    'color.app.ink': '#1a1a1a',
    'color.riso.paper': '#f1e9d4',
    'color.riso.sheet': '#f8f5ee',
    'color.riso.ink': '#000000',
    'color.riso.ink-2': '#494744',
    'color.riso.tint-35': '#9d9a93',
    'color.riso.tint-18': '#c6c2b9',
    'color.riso.highlight': '#ffe800',
    'opacity.riso-grain': '0.62',
    'radius.control': '0px',
    'text.body': '15px',
  };
  for (const [path, value] of Object.entries(expected))
    assert.equal(resolvedTokens[path]?.cssValue, value);
  assert.deepEqual(resolvedTokens['font.display']?.$value, [
    'Big Shoulders Display',
    'Arial Narrow',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ]);
  assert.equal((resolvedTokens['font.body']?.$value as string[])[0], 'Archivo');
  assert.equal(
    (resolvedTokens['font.mono']?.$value as string[])[0],
    'Spline Sans Mono',
  );
});

test('all semantic tokens are aliases with valid, same-type targets', () => {
  for (const [path, token] of Object.entries(tokens)) {
    if (path.startsWith('primitive.')) continue;
    assert.match(String(token.$value), /^\{[^{}]+\}$/);
    assert.ok(resolvedTokens[path]);
  }
});

test('invalid references, cycles, type mismatches and malformed values fail', () => {
  assert.throws(
    () => resolveTokens({ a: { $type: 'number', $value: '{missing}' } }),
    /Missing alias/,
  );
  assert.throws(
    () =>
      resolveTokens({
        a: { $type: 'number', $value: '{b}' },
        b: { $type: 'number', $value: '{a}' },
      }),
    /Circular/,
  );
  assert.throws(
    () =>
      resolveTokens({
        a: { $type: 'number', $value: '{b}' },
        b: { $type: 'dimension', $value: { value: 1, unit: 'px' } },
      }),
    /type mismatch/,
  );
  assert.throws(
    () => resolveTokens({ a: { $type: 'color', $value: '#ffffff' } }),
    /Invalid color/,
  );
  assert.throws(
    () =>
      resolveTokens({
        a: {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: [1, 2, 1] },
        },
      }),
    /Invalid color/,
  );
  assert.throws(
    () =>
      flattenTokens(
        { a: { $type: 'number', $value: 1 } },
        { a: { $type: 'number', $value: 2 } },
      ),
    /Duplicate/,
  );
  assert.throws(
    () =>
      resolveTokens({
        'a.b': { $type: 'number', $value: 1 },
        'a-b': { $type: 'number', $value: 2 },
      }),
    /collision/,
  );
});

test('output is deterministic and retains aliases and scoped roles', () => {
  const css = renderTheme(tokens);
  assert.equal(
    css,
    renderTheme(Object.fromEntries(Object.entries(tokens).reverse())),
  );
  assert.match(css, /--ds-color-app-canvas: var\(--ds-primitive-color-white\)/);
  assert.match(css, /\[data-intangibility-tier="riso"\]/);
  assert.match(css, /@theme inline static/);
  assert.match(css, /--color-canvas: var\(--ds-color-canvas\)/);
});
