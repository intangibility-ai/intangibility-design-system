import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'components/modal': 'src/components/Modal.tsx',
  },
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
