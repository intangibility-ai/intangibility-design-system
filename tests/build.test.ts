import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, access } from 'node:fs/promises';
import { test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

test('package exports import as ESM and require as CJS', async () => {
  const packageName = '@intangibility/design-system';
  const esm = await import(packageName);
  const cjs = createRequire(import.meta.url)('@intangibility/design-system');
  assert.equal(esm.resolvedTokens['color.riso.paper'].cssValue, '#f2ede2');
  assert.deepEqual(esm.resolvedTokens, cjs.resolvedTokens);
  assert.equal(esm.renderTheme(esm.tokens), cjs.renderTheme(cjs.tokens));
  await access(new URL('../dist/index.d.ts', import.meta.url));
  await access(new URL('../dist/index.d.cts', import.meta.url));
});

test('built exports work in plain Node without a TypeScript loader', () => {
  for (const [format, statement] of [
    [
      'module',
      "import { resolvedTokens } from '@intangibility/design-system';",
    ],
    [
      'commonjs',
      "const { resolvedTokens } = require('@intangibility/design-system');",
    ],
  ]) {
    const result = execFileSync(
      process.execPath,
      [
        `--input-type=${format}`,
        '--eval',
        `${statement} console.log(resolvedTokens['color.app.ink'].cssValue);`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(result.trim(), '#1a1a1a');
  }
});

test('ESM and CJS declarations typecheck through package exports', () => {
  const sources = new Map([
    [
      fileURLToPath(new URL('./declaration-consumer.mts', import.meta.url)),
      `
      import { resolvedTokens, tokens, renderTheme, type ResolvedToken } from '@intangibility/design-system';
      const token: ResolvedToken | undefined = resolvedTokens['color.app.canvas'];
      const css: string = renderTheme(tokens);
      import { Button, Modal, type ButtonProps, type ModalProps } from '@intangibility/design-system/components';
      const buttonProps: ButtonProps = { variant: 'danger', type: 'submit' };
      const modalProps: ModalProps = { open: true, title: 'Edit', onClose() {}, children: null };
      void Button; void Modal; void buttonProps; void modalProps;
      void token; void css;
    `,
    ],
    [
      fileURLToPath(new URL('./declaration-consumer.cts', import.meta.url)),
      `
      import system = require('@intangibility/design-system');
      const token: system.ResolvedToken | undefined = system.resolvedTokens['color.riso.paper'];
      const css: string = system.renderTheme(system.tokens);
      import components = require('@intangibility/design-system/components');
      const buttonProps: components.ButtonProps = { variant: 'secondary' };
      const fieldProps: components.FieldProps = { label: 'Name', children: null };
      void buttonProps; void fieldProps;
      void token; void css;
    `,
    ],
  ]);
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    types: ['node'],
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (
    path,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const source = sources.get(path);
    return source === undefined
      ? getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(path, source, languageVersion, true);
  };
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    diagnostics
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      )
      .join('\n'),
  );
});

test('font imports resolve from Fontsource dependencies, never local binaries', async () => {
  const css = await readFile(
    new URL('../styles/fonts.css', import.meta.url),
    'utf8',
  );
  const imports = [...css.matchAll(/@import '([^']+)'/g)];
  assert.equal(imports.length, 7);
  const require = createRequire(import.meta.url);
  for (const [, specifier] of imports) {
    assert.ok(specifier?.startsWith('@fontsource/'));
    await access(require.resolve(specifier!));
  }
  assert.ok(require.resolve('@intangibility/design-system/theme.css'));
  assert.ok(require.resolve('@intangibility/design-system/fonts.css'));
});
