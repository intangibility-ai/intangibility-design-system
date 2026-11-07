import { readFile, writeFile } from 'node:fs/promises';
import { renderTheme, tokens } from '../src/index';

const path = new URL('../styles/theme.css', import.meta.url);
const css = renderTheme(tokens);
if (process.argv.includes('--check')) {
  const committed = await readFile(path, 'utf8').catch(() => '');
  if (committed !== css) {
    console.error(
      'styles/theme.css is stale. Run pnpm generate and commit the result.',
    );
    process.exitCode = 1;
  } else {
    console.log('styles/theme.css is current.');
  }
} else {
  await writeFile(path, css);
  console.log('Generated styles/theme.css.');
}
