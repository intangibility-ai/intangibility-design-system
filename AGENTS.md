# Intangibility design system

## Scope

The first release is foundations only: DTCG tokens, typography, and Tailwind v4
theme CSS. Do not add React or other framework components without a new brief.
Do not publish packages, push commits, or edit consumer repositories implicitly.

## Authority and naming

- `src/tokens/primitives.json` contains literal values; `semantic.json` contains
  aliases only. Use DTCG 2025.10 `$type`/`$value`, inherited group types, sRGB color
  objects, dimension objects, and full-token `{path.to.token}` references.
- `color.app.*` is white app chrome; `color.riso.*` is cream paper. Never collapse
  these tiers or treat them as light/dark modes.
- Display is Big Shoulders Display, body/UI is Archivo, mono is Spline Sans Mono.
  Load fonts only through Fontsource packages and opt-in `styles/fonts.css`.
- Source provenance and conflicts are in README.md. Product values win over
  landing values on the same role; document each new disagreement. Do not
  normalize marketing artwork into product interaction tokens.
- Token keys are lowercase kebab-case; dot paths become `--ds-*` properties.
  Tailwind theme names mirror semantic paths. Reject aliases with missing
  targets, cycles, mismatched types, or CSS-name collisions.

## Implementation

- Pin Node 22.23.2 and pnpm 10.15.1. Use `mise exec -- pnpm …` if shell tools differ.
- Edit JSON, then run `pnpm generate`; never edit `styles/theme.css` by hand.
- The generator is deterministic and preserves CSS aliases. Builds check
  freshness rather than regenerating, so stale CSS cannot be silently repaired.
- JS exports are side-effect-free ESM/CJS with declarations. CSS imports are
  separate package exports. Do not import CSS or fonts from `src/index.ts`.
- No global typography/reset styles: consuming applications choose where to
  apply typography utilities and `data-intangibility-tier` attributes.
- Extend serializer support with explicit validation and negative tests before
  introducing new DTCG types. Current scope does not claim a complete DTCG parser.
- Keep dependencies and the pnpm lockfile in sync; avoid font binaries and build
  output in Git. Validate actual Tailwind v4 compilation, not just CSS snapshots.

## Verification

Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
`pnpm test` builds before testing package self-imports as ESM and CJS, verifies
declaration artifacts and Fontsource paths, rejects invalid tokens, checks the
committed CSS, and compiles representative Tailwind utilities.

Before a commit, review `git diff --check` and the staged diff. Never revert or
overwrite work you did not make. Commit only when explicitly authorized.
