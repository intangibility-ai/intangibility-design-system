export type TokenType =
  'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number';

export interface Token {
  $type: TokenType;
  $value: unknown;
  $description?: string;
}

export interface ResolvedToken extends Token {
  path: string;
  cssName: string;
  cssValue: string;
}

const types = new Set<TokenType>([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'number',
]);
const reference = /^\{([^{}]+)\}$/;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Flatten the supported DTCG subset, honoring inherited group types. */
export function flattenTokens(...documents: unknown[]): Record<string, Token> {
  const result: Record<string, Token> = {};
  function visit(node: unknown, path: string[], inherited?: TokenType): void {
    if (!object(node))
      throw new Error(`Invalid token group: ${path.join('.')}`);
    const type = (node.$type ?? inherited) as TokenType;
    if ('$value' in node) {
      const name = path.join('.');
      if (!name || !types.has(type))
        throw new Error(`Unsupported type: ${name}`);
      if (name in result) throw new Error(`Duplicate token: ${name}`);
      result[name] = {
        $type: type,
        $value: node.$value,
        ...(typeof node.$description === 'string'
          ? { $description: node.$description }
          : {}),
      };
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (!/^[a-z0-9-]+$/.test(key))
        throw new Error(`Invalid token key: ${key}`);
      visit(child, [...path, key], type);
    }
  }
  for (const document of documents) visit(document, []);
  return result;
}

function serialize(type: TokenType, value: unknown, path: string): string {
  const fail = (): never => {
    throw new Error(`Invalid ${type} value: ${path}`);
  };
  switch (type) {
    case 'color': {
      if (!object(value) || value.colorSpace !== 'srgb') return fail();
      const components = value.components;
      if (
        !Array.isArray(components) ||
        components.length !== 3 ||
        !components.every(
          (n) =>
            typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1,
        )
      )
        return fail();
      const alpha = value.alpha ?? 1;
      if (
        typeof alpha !== 'number' ||
        !Number.isFinite(alpha) ||
        alpha < 0 ||
        alpha > 1
      )
        return fail();
      const hex = `#${components
        .map((n: number) =>
          Math.round(n * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')}`;
      if (value.hex !== undefined && value.hex !== hex) return fail();
      return alpha === 1
        ? hex
        : `rgb(${components.map((n: number) => Math.round(n * 255)).join(' ')} / ${alpha})`;
    }
    case 'dimension':
      if (
        !object(value) ||
        typeof value.value !== 'number' ||
        !Number.isFinite(value.value) ||
        !['px', 'rem'].includes(String(value.unit))
      )
        return fail();
      return `${value.value}${value.unit}`;
    case 'fontFamily': {
      const families = typeof value === 'string' ? [value] : value;
      if (
        !Array.isArray(families) ||
        !families.length ||
        !families.every(
          (family) =>
            typeof family === 'string' && /^[a-zA-Z0-9 -]+$/.test(family),
        )
      )
        return fail();
      const generic = new Set([
        'serif',
        'sans-serif',
        'monospace',
        'system-ui',
        'ui-serif',
        'ui-sans-serif',
        'ui-monospace',
      ]);
      return families
        .map((family: string) => (generic.has(family) ? family : `"${family}"`))
        .join(', ');
    }
    case 'fontWeight':
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 1 ||
        value > 1000
      )
        return fail();
      return String(value);
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return fail();
      return String(value);
  }
}

/** Resolve aliases with explicit missing-reference, cycle, and type checks. */
export function resolveTokens(
  tokens: Record<string, Token>,
): Record<string, ResolvedToken> {
  const resolved: Record<string, ResolvedToken> = {};
  const visiting = new Set<string>();
  const names = new Set<string>();
  function resolve(path: string): ResolvedToken {
    if (resolved[path]) return resolved[path];
    const token = tokens[path];
    if (!token) throw new Error(`Missing alias target: ${path}`);
    if (visiting.has(path)) throw new Error(`Circular alias: ${path}`);
    visiting.add(path);
    let value = token.$value;
    const match = typeof value === 'string' ? reference.exec(value) : null;
    if (match) {
      const target = resolve(match[1]!);
      if (target.$type !== token.$type)
        throw new Error(`Alias type mismatch: ${path}`);
      value = target.$value;
    }
    const cssName = `--ds-${path.replaceAll('.', '-')}`;
    if (names.has(cssName)) throw new Error(`CSS name collision: ${cssName}`);
    names.add(cssName);
    const entry = {
      ...token,
      $value: value,
      path,
      cssName,
      cssValue: serialize(token.$type, value, path),
    };
    resolved[path] = entry;
    visiting.delete(path);
    return entry;
  }
  for (const path of Object.keys(tokens).sort()) resolve(path);
  return resolved;
}

const commonRoles = {
  canvas: ['canvas', 'paper'],
  paper: ['paper', 'paper'],
  sheet: ['paper', 'sheet'],
  ink: ['ink', 'ink'],
  muted: ['muted', 'ink-2'],
  line: ['line', 'tint-18'],
  'control-line': ['control-line', 'ink'],
  placeholder: ['placeholder', 'tint-35'],
  signal: ['signal', 'ink'],
  'on-signal': ['on-signal', 'paper'],
  focus: ['focus', 'ink'],
} as const;

/** Deterministic output: no timestamps, filesystem access, or external tools. */
export function renderTheme(tokens: Record<string, Token>): string {
  const resolved = resolveTokens(tokens);
  const entries = Object.entries(resolved).sort(([a], [b]) =>
    a.localeCompare(b, 'en'),
  );
  function declaration(path: string): string {
    const token = tokens[path]!;
    const match =
      typeof token.$value === 'string' ? reference.exec(token.$value) : null;
    return match
      ? `var(${resolved[match[1]!]!.cssName})`
      : resolved[path]!.cssValue;
  }
  function roles(tier: 'app' | 'riso'): string[] {
    return Object.entries(commonRoles).map(([role, targets]) => {
      const path = `color.${tier}.${targets[tier === 'app' ? 0 : 1]}`;
      if (!resolved[path]) throw new Error(`Missing tier role: ${path}`);
      return `  --ds-color-${role}: var(${resolved[path].cssName});`;
    });
  }
  const theme = entries
    .filter(([path]) =>
      /^(color|font|text|leading|font-weight|radius)\./.test(path),
    )
    .map(
      ([path, token]) =>
        `  --${path.replaceAll('.', '-')}: var(${token.cssName});`,
    );
  theme.push(
    ...Object.keys(commonRoles).map(
      (role) => `  --color-${role}: var(--ds-color-${role});`,
    ),
  );
  return [
    '/* Generated from src/tokens/*.json. Run pnpm generate; do not edit. */',
    ':root {',
    ...entries.map(
      ([path, token]) => `  ${token.cssName}: ${declaration(path)};`,
    ),
    ...roles('app'),
    '}',
    '',
    '[data-intangibility-tier="app"] {',
    ...roles('app'),
    '}',
    '',
    '[data-intangibility-tier="riso"] {',
    ...roles('riso'),
    '}',
    '',
    '/* Inline utilities resolve scoped roles on the consuming element. */',
    '@theme inline static {',
    ...theme,
    '}',
    '',
  ].join('\n');
}
