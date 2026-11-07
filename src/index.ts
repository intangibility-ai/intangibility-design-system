import primitives from './tokens/primitives.json';
import semantic from './tokens/semantic.json';
import { flattenTokens, resolveTokens } from './token-engine';

/** DTCG source documents; CSS and font loading remain opt-in. */
export const tokenDocuments = { primitives, semantic };
export const tokens = flattenTokens(primitives, semantic);
export const resolvedTokens = resolveTokens(tokens);
export { flattenTokens, resolveTokens, renderTheme } from './token-engine';
export type { Token, TokenType, ResolvedToken } from './token-engine';
