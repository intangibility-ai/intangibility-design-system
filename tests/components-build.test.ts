import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { test } from 'vitest';
import { compile } from '@tailwindcss/node';
import { tokens } from '../src/index';

test('component exports work in plain ESM/CJS without bundling React Aria or CSS', () => {
  for (const [format, statement] of [
    [
      'module',
      "import * as components from '@intangibility/design-system/components';",
    ],
    [
      'commonjs',
      "const components = require('@intangibility/design-system/components');",
    ],
  ]) {
    const output = execFileSync(
      process.execPath,
      [
        `--input-type=${format}`,
        '--eval',
        `${statement} console.log(['Button','ButtonLink','Input','Textarea','Tag','Panel','Field','Modal','cn'].every(key => typeof components[key] === 'function'));`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(output.trim(), 'true');
  }
});

test('component CSS is exported, token-only, and compiles alongside Tailwind', async () => {
  const require = createRequire(import.meta.url);
  const css = await readFile(
    require.resolve('@intangibility/design-system/components.css'),
    'utf8',
  );
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\bui-|ui\.css|@import/i);
  const theme = await readFile(
    require.resolve('@intangibility/design-system/theme.css'),
    'utf8',
  );
  for (const [, name] of css.matchAll(/var\(--(ds-[a-z0-9-]+)\)/g)) {
    assert.ok(theme.includes(`--${name}:`), `Missing ${name}`);
  }
  const compiler = await compile(`@import 'tailwindcss';\n${theme}\n${css}`, {
    base: process.cwd(),
    onDependency() {},
  });
  const output = compiler.build(['px-4']);
  for (const name of [
    'button',
    'control',
    'tag',
    'panel',
    'field-label',
    'modal-overlay',
  ])
    assert.ok(output.includes(`.ds-${name}`));
  assert.match(output, /@layer components/);
  assert.equal(tokens['space.sm']?.$value, '{primitive.space.8}');
});

test('built components retain external peer imports and separate declarations', async () => {
  const esm = await readFile(
    new URL('../dist/components/index.js', import.meta.url),
    'utf8',
  );
  const cjs = await readFile(
    new URL('../dist/components/index.cjs', import.meta.url),
    'utf8',
  );
  assert.match(esm, /from ["']react-aria-components["']/);
  assert.match(cjs, /require\(["']react-aria-components["']\)/);
  assert.doesNotMatch(esm, /styles\/|\.css["']/);
  for (const extension of ['ts', 'cts']) {
    const declaration = await readFile(
      new URL(`../dist/components/index.d.${extension}`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /ModalProps/);
    assert.match(declaration, /ButtonLinkProps/);
  }
});
