import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/components/index.ts'],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react-aria-components',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'node22',
  sourcemap: true,
});
