import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { test } from 'vitest';
import { compile } from '@tailwindcss/node';
import { tokens } from '../src/index';

test('component exports work in plain ESM/CJS and exclude Modal', () => {
  for (const [format, statement] of [
    [
      'module',
      "import * as components from '@boopdoopgoop/design-system/components';",
    ],
    [
      'commonjs',
      "const components = require('@boopdoopgoop/design-system/components');",
    ],
  ]) {
    const output = execFileSync(
      process.execPath,
      [
        `--input-type=${format}`,
        '--eval',
        `${statement} console.log(!('Modal' in components) && ['Button','ButtonLink','Input','Textarea','Tag','Panel','Field','cn'].every(key => typeof components[key] === 'function'));`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(output.trim(), 'true');
  }
});

test('component CSS is exported, token-only, and compiles alongside Tailwind', async () => {
  const require = createRequire(import.meta.url);
  const css = await readFile(
    require.resolve('@boopdoopgoop/design-system/components.css'),
    'utf8',
  );
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\bui-|ui\.css|@import/i);
  const theme = await readFile(
    require.resolve('@boopdoopgoop/design-system/theme.css'),
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

test('built components entries never reference the optional React Aria peer', async () => {
  for (const extension of ['js', 'cjs']) {
    const entry = await readFile(
      new URL(`../dist/components/index.${extension}`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(entry, /react-aria-components/);
    assert.doesNotMatch(entry, /styles\/|\.css["']/);
  }
  for (const extension of ['ts', 'cts']) {
    const declaration = await readFile(
      new URL(`../dist/components/index.d.${extension}`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(declaration, /ModalProps|react-aria-components/);
    assert.match(declaration, /ButtonLinkProps/);
  }
});

test('Modal subpath works in plain ESM/CJS and retains its external peer', async () => {
  for (const [format, statement] of [
    [
      'module',
      "import { Modal } from '@boopdoopgoop/design-system/components/modal';",
    ],
    [
      'commonjs',
      "const { Modal } = require('@boopdoopgoop/design-system/components/modal');",
    ],
  ]) {
    const output = execFileSync(
      process.execPath,
      [
        `--input-type=${format}`,
        '--eval',
        `${statement} console.log(typeof Modal);`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(output.trim(), 'function');
  }
  const esm = await readFile(
    new URL('../dist/components/modal.js', import.meta.url),
    'utf8',
  );
  const cjs = await readFile(
    new URL('../dist/components/modal.cjs', import.meta.url),
    'utf8',
  );
  assert.match(esm, /from ["']react-aria-components["']/);
  assert.match(cjs, /require\(["']react-aria-components["']\)/);
  assert.doesNotMatch(esm, /styles\/|\.css["']/);
  for (const extension of ['ts', 'cts']) {
    const declaration = await readFile(
      new URL(`../dist/components/modal.d.${extension}`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /ModalProps/);
  }
});

test('consumer Node engine has the supported floor and no upper bound', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  );
  assert.equal(manifest.engines.node, '>=22.22.2');
});
