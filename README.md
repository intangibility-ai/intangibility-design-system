# Intangibility design system · 0.2.1

DTCG tokens, fixed typography, a Tailwind CSS v4 theme, and opt-in React 19
components. No global reset, application styles, font binaries, or npm
publication are included. The foundation-only root export remains independent
of React; components are available from a separate subpath.

## Use

In a consumer's CSS (Tailwind v4 must process the theme):

```css
@import 'tailwindcss';
@import '@boopdoopgoop/design-system/fonts.css'; /* optional */
@import '@boopdoopgoop/design-system/theme.css';
@import '@boopdoopgoop/design-system/components.css'; /* optional */
```

```html
<main data-intangibility-tier="app" class="bg-canvas text-ink font-body">
  <h1 class="font-display font-black text-display leading-display">
    Workspace
  </h1>
  <p class="text-body leading-body">Archivo body copy.</p>
  <section data-intangibility-tier="riso" class="bg-canvas text-ink">
    <article class="bg-riso-sheet">A risograph sheet.</article>
  </section>
</main>
```

App is the default. Named utilities such as `bg-app-canvas`, `text-app-ink`,
`bg-riso-paper`, and `text-riso-ink` never switch tiers. Generic roles (`canvas`,
`paper`, `sheet`, `ink`, `muted`, `line`, `control-line`, `placeholder`, `signal`,
`on-signal`, `focus`) switch through the opt-in attribute. App `sheet` maps to
white paper; riso `canvas` maps to cream paper. Riso `muted` maps to ink-2,
`line` to tint-18, `placeholder` to tint-35, and filled controls/focus to black.
Statuses and app tile colors stay explicitly `app-*`; there are no invented
risograph success/danger colors. Nested tiers can reset to `app`.

Without Tailwind, ordinary `--ds-*` properties remain usable:

```css
.document {
  color: var(--ds-color-riso-ink);
  background: var(--ds-color-riso-paper);
  font-family: var(--ds-font-body);
  font-size: var(--ds-text-body);
  line-height: var(--ds-leading-body);
}
```

The `@theme inline static` block maps semantic values to utilities. `inline`
ensures utilities resolve scoped variables on their consuming element; `static`
keeps named theme properties available even when no matching utility is used.
The package does not change Tailwind's unrelated defaults.

```ts
import {
  tokens,
  resolvedTokens,
  tokenDocuments,
} from '@boopdoopgoop/design-system';

resolvedTokens['color.riso.paper']?.cssValue; // '#f2ede2'
tokens['color.riso.paper']?.$value; // '{primitive.color.paper}'
tokenDocuments.semantic; // original DTCG document
```

CommonJS `require('@boopdoopgoop/design-system')` exposes the same API. Both
formats have declarations. Raw JSON exports are `tokens/primitives.json` and
`tokens/semantic.json`. `flattenTokens`, `resolveTokens`, and `renderTheme` are
also exported. Their supported DTCG subset is color (sRGB), dimension (px/rem),
fontFamily, numeric fontWeight, number, inherited group types, and whole-token
aliases. This is not a general DTCG validator or an arbitrary CSS serializer.

### Typography

| Role      | Family                | Size | Weight  | Leading           |
| --------- | --------------------- | ---- | ------- | ----------------- |
| Display   | Big Shoulders Display | 32px | 900     | 1                 |
| Heading   | Big Shoulders Display | 24px | 900     | 1                 |
| Body      | Archivo               | 15px | 400     | 1.45              |
| UI copy   | Archivo               | 14px | 400–700 | 1.4               |
| Mono/data | Spline Sans Mono      | 12px | 400/500 | consumer-selected |
| Label     | Spline Sans Mono      | 11px | 400     | 1.25              |

These are independent utilities, not automatic type styles. Display/heading,
body, and mono/label sizes come from `R:175–202,544–552`; UI copy is `U:105–107`
at a 16px root. The label leading is a release convention, not a source-wide
label declaration. Input-specific leading `U:198` is not the UI-copy token.
Fluid hero sizes, timer sizes, and per-screen layout stay with consumers.
Component label tracking is now tokenized. Fontsource loading is explicit: Big Shoulders 900; Archivo
400/500/600/700; Spline Sans Mono 400/500. Other weights/italics require separate
Fontsource imports. Static family names are used, not unavailable `Variable`
faces. No Newsreader, Space Mono, or alternative display family ships.

### Tier values

| Tier            | Canvas / paper | Sheet   | Ink     | Secondary | Rule tint | Highlight |
| --------------- | -------------- | ------- | ------- | --------- | --------- | --------- |
| App chrome      | #ffffff        | #ffffff | #1a1a1a | #666666   | #d1d1d1   | —         |
| Risograph paper | #f2ede2        | #f8f5ee | #000000 | #494744   | #c6c2b9   | #ffe800   |

Riso tint-35 is `#9d9a93`. Both palettes remain named tiers, never one blended
palette or dark/light modes. JSON literals live in primitives; semantic values
are aliases, including shared white and ink references. CSS preserves aliases.
Sharp control radius, app/riso border and focus widths, and riso grain opacity
are included. Product-specific grading/chart/syntax palettes, toast materials,
textures, shadows, animation recipes, and per-screen layout values are not exported;
their conflicts are still documented below. Nothing
in either source repository was migrated or edited.

### Components

Install the peers `react@^19` and `react-dom@^19`.
`react-aria-components@^1.21.1` is an optional peer required only for `Modal`.
Import Modal from `@boopdoopgoop/design-system/components/modal`; the regular
`components` entry does not import React Aria and works without that peer.
React Aria is external in both builds, never bundled.
JavaScript imports load neither CSS nor fonts. Import `theme.css` before
`components.css`; recipes live in `@layer components` so Tailwind utilities can
override them. `cn` uses `clsx` and `tailwind-merge`, matching the product.

```tsx
import {
  Button,
  ButtonLink,
  Field,
  Input,
} from '@boopdoopgoop/design-system/components';
import { Modal } from '@boopdoopgoop/design-system/components/modal';

<Field label="Email" hint="Use your work email." error={emailError}>
  <Input type="email" name="email" />
</Field>;
<Button variant="primary" type="submit">
  Save
</Button>;
<ButtonLink variant="secondary" href="/settings">
  Settings
</ButtonLink>;
<Modal
  open={open}
  title="Edit profile"
  busy={saving}
  onClose={() => setOpen(false)}
  footer={<Button onClick={save}>Save</Button>}
>
  <Input aria-label="Name" />
</Modal>;
```

| Component           | Product-compatible props/defaults                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Button`            | Native button props/ref; `variant`: primary (default), secondary, danger; `type="button"` by default                   |
| `ButtonLink`        | Native anchor props; same variants; no invented disabled-link behavior                                                 |
| `Input`, `Textarea` | Native props/ref; no controlled-state or validation implementation                                                     |
| `Tag`               | `children`, `className`, `tone`: neutral (default), success, warning, danger, info                                     |
| `Panel`             | `title`, `actions`, `children`, `className`, `headerClassName`, `bodyClassName`; header/actions require a truthy title |
| `Field`             | `label`, `hint`, `error`, `children`, `className`, `interactiveLabel=true`                                             |
| `Modal`             | `open`, `title`, `busy=false`, `onClose`, `children`, `footer`, `className` (shell), `bodyClassName`                   |

Field wires a single direct control element to stable generated hint/error IDs,
preserving its existing ID/descriptions and marking errors `aria-invalid`.
With `interactiveLabel=false`, its label names that control via
`aria-labelledby`. Custom controls must forward those attributes to the actual
input. With fragments or multiple/wrapped children, implicit label behavior is
retained; callers must wire descriptions themselves. Error text retains
`role="alert"`.

Modal uses React Aria's `ModalOverlay`, `Modal`, `Dialog`, and title `Heading`.
React Aria owns focus containment/restoration, portals, and Escape. `busy`
blocks the close callback and outside dismissal and disables the close button;
it does not override parent changes to `open`. A truthy footer adds a bounded,
scrollable body and pinned actions, matching the product. React Aria portals
into the document body, so local ancestor tier attributes do not cross the
portal: use a document-level tier for modals. No focus trap is implemented here.
Router-specific `ButtonRouteLink` and the product's `Banner` are out of scope.

#### Release-two provenance and presentation decisions

Behavior and prop names come from product `apps/web/app/components/ui/`
`Button.tsx`, `Control.tsx`, `Tag.tsx`, `Panel.tsx`, `Field.tsx`, `Modal.tsx`,
and `apps/web/app/lib/cn.ts`. No `ui.css`, legacy `ui-*` classes, or copied color
literals are used. This release changes presentation, not the source recipes:

- Existing tier-aware paper/ink/signal roles drive surfaces/actions; statuses
  stay explicit app colors, never invented riso status tokens. Recipes choose
  app border/focus dimensions in both tiers; the thicker riso foundations are
  not treated as a component recipe.
- Source 9/10px mono labels become the existing 11px label role. Panel headings
  use the loaded mono regular weight rather than unshipped mono semibold.
- Source Field/Modal serif text becomes Archivo body/UI and Big Shoulders
  headings, respectively, honoring package typography authority.
- Placeholder text uses the tier's muted role for readable contrast, rather
  than the lighter riso placeholder tint. Neutral Tag border uses control-line.
  Warning Tag uses explicit app paper behind app warning ink: that pair meets
  small-text contrast, whereas warning ink directly on cream riso paper does not.
- New spacing/size/tracking/layer/opacity primitives and alias-only semantic
  tokens capture source JSX geometry and disabled/backdrop states (44px control,
  32px close, 480px modal). The 96px textarea minimum and 5% token-derived hover
  mix are package conventions, not claims about unread product CSS.
- No product shadow, animation, or marketing extrusion is imported. Sharp
  controls, focus-visible outlines, and consumer utility overrides stay explicit.
- Field's generated description/error wiring is an accessibility addition;
  the product only supplied an implicit wrapping label and alert text.

## Develop

```sh
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm generate # after changing JSON
mise exec -- pnpm format:write
mise exec -- pnpm format
mise exec -- pnpm lint
mise exec -- pnpm typecheck
mise exec -- pnpm test
mise exec -- pnpm build
```

Development and CI use Node **22.23.2** and pnpm **10.15.1**, pinned in
`mise.toml` and `packageManager`. Consumers support Node **>=22.22.2** with no
upper bound. `generate:check`, the build, and the CSS freshness test fail for stale
committed CSS; none auto-repairs it. Test builds first, then imports the built
ESM/CJS package under Vitest, verifies declarations and Fontsource paths,
validates aliases and both palettes, and compiles real Tailwind v4 utilities.
The original ten assertions-based tests remain in Node; component tests use
jsdom and Testing Library, including React Aria focus containment and Escape.
`dist/` and
`node_modules/` are uncommitted. Future-run conventions are in `AGENTS.md`.

## Source audit and every disagreement

Read-only sources inspected for this release:

- Product: `/Users/henrycen/Developer/archive/intangibility`, HEAD
  `a67554f560d31021736c835fb2b4964c5effd36a` (working-tree CSS was read).
- Landing: `intangibility-ai/intangibility-web`, cloned to `/tmp/landing-read`,
  HEAD `d9e26a60a815654278a9de354ed723625c1f5a55`.

Table references use these paths and original line numbers:

| Key | File                                                           |
| --- | -------------------------------------------------------------- |
| T   | product `apps/web/app/styles/theme.css`                        |
| R   | product `apps/web/app/styles/risograph.css`                    |
| U   | product `apps/web/app/styles/ui.css`                           |
| L   | landing `src/styles.css`                                       |
| O   | landing `src/components/concepts/directions/overprint.css`     |
| OL  | landing `src/components/concepts/landing/overprintLanding.css` |
| D   | landing `src/components/concepts/directions/shared.css`        |
| F   | landing `src/components/concepts/flight/flight.css`            |
| S   | landing `src/components/concepts/landing/overprintSchemes.ts`  |
| M   | landing `src/components/concepts/landing/printMixerConfig.ts`  |
| C   | landing `src/components/concepts/landing/OverprintLanding.tsx` |

All four concept CSS files were read. S/M/C were also inspected to distinguish
active inline overrides from fallback CSS. Active landing uses greyscale and
Space Mono (`C:50–53,132`), not the base purple-black ink/pink shadows. **Product
wins for the same role**; the fixed font trio overrides both repositories'
historical choices. Rows about component recipes describe the future migration
decision, not extra components/CSS shipped by this release.

### Global landing versus app chrome

| Same role                    | Landing                                                          | Product winner                                             |
| ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Canvas                       | `oklch(.985 .003 90)` L:66; actual HTML/body `#f1e9d4` L:145,150 | `#ffffff` T:6                                              |
| Primary/card/popover text    | `oklch(.12 0 0)` L:67,69,71                                      | `#1a1a1a` T:8                                              |
| Primary action fill          | `oklch(.55 .24 27)` L:72                                         | `#454545` T:14, U:148                                      |
| Primary action text          | `oklch(.985 .003 90)` L:73                                       | `#ffffff` T:15; textured control exception `#f7f7f5` U:154 |
| Secondary surface/text       | `oklch(.94 .005 90)` / `oklch(.12 0 0)` L:74–75                  | `#ffffff` / `#1a1a1a` T:7–8, U:142                         |
| Muted surface/text           | `oklch(.94 .005 90)` / `oklch(.45 0 0)` L:76–77                  | `#f4f4f2` / `#666666` T:9–10                               |
| Danger ink                   | `oklch(.55 .24 27)` L:80                                         | `#9b2c2c` T:19, U:92,99                                    |
| General border               | `oklch(.12 0 0)` L:82,140–141                                    | `#d1d1d1` T:11                                             |
| Input border                 | `oklch(.12 0 0)` L:83                                            | `#949494` T:12, U:191                                      |
| Focus/ring                   | `oklch(.55 .24 27)` L:84                                         | `#1a1a1a` T:16, U:165                                      |
| Sidebar background/text      | `oklch(.985 .003 90)` / `oklch(.12 0 0)` L:90–91                 | `#ffffff` / `#1a1a1a` T:6,8,38                             |
| Sidebar navigation fill/text | `oklch(.55 .24 27)` / `oklch(.985 .003 90)` L:92–93              | `#454545` / `#ffffff` T:14–15,48–49                        |
| Sidebar subtle surface/text  | `oklch(.94 .005 90)` / `oklch(.12 0 0)` L:94–95                  | `#f4f4f2` / `#1a1a1a` T:8,10 (if subtle chrome)            |
| Sidebar border/focus         | `oklch(.12 0 0)` / `oklch(.55 .24 27)` L:96–97                   | `#d1d1d1` / `#1a1a1a` T:11,16                              |

### Active landing versus candidate risograph

| Same role                          | Landing                                                                                                      | Product winner                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Page stock                         | `#f1e9d4` OL:56–57, L:145,150                                                                                | paper `#f2ede2` R:12,35                                                        |
| Preview sheet                      | stock `#f1e9d4` OL:1194–1195                                                                                 | sheet `#f8f5ee` R:13,69                                                        |
| Shared marker/highlight            | effective warm red `#f24822`, multiply .85 OL:1623–1627, C:28–29,132, S:22 (CSS fallback yellow)             | solid `#ffe800` R:18,206–209; hero art may stay separate                       |
| Grain strength                     | .62; dark concept .32 OL:1489–1497                                                                           | .1 R:20,55–60                                                                  |
| Body/UI size                       | 14px O:15, OL:1189                                                                                           | 15px R:38                                                                      |
| Product wordmark size              | 24px base / 22px landing / 20px preview O:82, OL:105,1205                                                    | `clamp(20px,2.4vw,28px)` R:105                                                 |
| Preview wordmark tracking          | .03em OL:1205                                                                                                | .02em R:108                                                                    |
| Kicker tracking                    | .06em O:54, OL:517,1689                                                                                      | .08em R:122                                                                    |
| Section-label tracking             | .05em preview / .06em claims OL:1261,1428,517                                                                | .12em R:201                                                                    |
| Main action border                 | reset 0 O:39,98–118                                                                                          | 2px black R:353                                                                |
| Main action size/weight/tracking   | 14px (small 12.5px), 800, .04em O:107,109,111,137                                                            | 18px, 900, .06em R:358–360 (geometry only; package UI family is fixed Archivo) |
| Main action dimensions             | padding 14px 22px; small 9px 15px; no minimum O:103,136                                                      | minimum 56px; padding 0 28px R:351–352                                         |
| Main action shadow                 | grey 6px 6px OL:1858–1860                                                                                    | none R:361                                                                     |
| Action hover/active                | hover translate -2px/-2px, grey 8px shadow; active +3px/+3px, grey 2px O:124,130, OL:1862–1866               | flat action, no landing lift R:349–361                                         |
| Action rough-edge texture          | SVG rough filter OL:1520                                                                                     | flat fill, no background image/shadow R:349–361; no rough filter to import     |
| Preview solid-action text          | sheet `#f8f5ee` OL:1255                                                                                      | paper `#f2ede2` R:356                                                          |
| Preview action size/tracking       | 17px / .04em OL:1249                                                                                         | 18px / .06em R:358,360                                                         |
| Preview action dimensions          | padding 12px 18px; no minimum OL:1249                                                                        | minimum 56px; padding 0 28px R:351–352                                         |
| Preview primary-action shadow      | grey 5px OL:1837–1839                                                                                        | none R:361                                                                     |
| Comparable secondary action border | 3px black OL:1250                                                                                            | confirm cancel 2px black R:702–706; confirmation sizing stays role-specific    |
| Sheet elevation                    | final chalky black 4px + hatched grey 8px OL:2194–2202,2288–2310                                             | solid black 6px + tint-18 12px; mobile 4px/8px R:71–73,755–758                 |
| Field elevation                    | final black plate 4px + grey 8px, grey outer plate `color-mix(p 55%,stock)` OL:2155–2157,2233–2238,2260–2275 | no landing extrusion on candidate input/command R:385–393,465–476              |
| Field hover motion                 | row -2px/-2px; plates 2px/6px OL:401–404,2269,2274–2275                                                      | no field lift in product R:465–483                                             |
| Input placeholder                  | ink-2 `#494744` OL:417                                                                                       | tint-35 `#9d9a93` R:478–479                                                    |
| Input focus                        | outline none; wrapper lift/extrusion OL:402–404,415                                                          | 3px black outline, 3px offset R:49–51                                          |
| Shared scroll-control focus offset | 2px OL:482                                                                                                   | 3px R:51                                                                       |
| Shared help typography             | 13px body, no uppercase/tracking OL:436                                                                      | 11px mono, uppercase, .06em R:364–369                                          |
| Shared support footer typography   | 14px, 700, .02em; mobile `clamp(5.5px,1.45vw,14px)`/.01em OL:559–566,702–705                                 | 11px mono, .06em R:491–503; marketing footer may stay separate                 |

Missing body leading in O:14–16 is not a contradictory value; product supplies
1.45. Landing email entry (15px Archivo, OL:414) is not the same role as the
product uppercase connection-code input (R:472–475). Shipped primary-action
knockout already matches product paper (OL:46, S:213).

### Base concept defaults, overridden on shipped landing

| Same role            | Landing fallback                        | Product winner                                               |
| -------------------- | --------------------------------------- | ------------------------------------------------------------ |
| Ink / secondary ink  | `#1b1820` / `#57505d` O:4–5             | `#000000` / `#494744` R:14–15; active scheme already matches |
| Separator tint       | `rgba(27,24,32,.18)` O:9,403,420,467    | opaque `#c6c2b9` R:17; active scheme matches                 |
| Shared marker yellow | `#ffd400` O:6,336                       | `#ffe800` R:18                                               |
| Main action text     | yellow O:105, OL:8,46                   | paper R:356; active on-solid already matches                 |
| Action shadow        | pink 4px + blue 8px O:112–114, OL:1521  | none R:361                                                   |
| Action hover shadow  | pink 6px + blue 11px O:125–127, OL:1522 | none R:361                                                   |
| Action active shadow | pink 1px + blue 2px O:131–133           | none R:361                                                   |
| Small action shadow  | pink 3px + blue 6px O:138–140           | none R:361                                                   |
| Grain opacity        | .4 O:63, OL:15                          | .1 R:20; active landing later uses .62                       |

### Product preview versus recruiter grading roles

These are explicitly product-screen previews (OL:1825–1826), not unrestricted
decorative palette choices. Grading-specific tokens are deferred from v0.1.

| Same role                      | Landing preview                                                    | Product winner                                                                |
| ------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Review/code canvas             | stock `#f1e9d4` OL:1195                                            | white T:6–7,38,105                                                            |
| Review/code text               | black OL:1188,1287, S:124,211                                      | `#1a1a1a` T:8,47,96,109                                                       |
| Secondary body/answer          | `#494744` OL:1426, S:112,125                                       | `#666666` T:9,44                                                              |
| Grading labels/notes           | `#494744` OL:1261,1324,1409,1428,1467                              | `#767676` T:13,45–46                                                          |
| Chrome/toolbar/code border     | 3px black OL:1200,1204,1257,1259,1261,1350,1427,1439               | `#d1d1d1` T:11,51,81,106; product width unspecified                           |
| Navigation fill/knockout       | black / sheet `#f8f5ee` OL:1255                                    | `#454545` / white T:14–15,48–49                                               |
| Editor/window header           | tint-35 `#9d9a93` OL:1349,1833                                     | mist `#f4f4f2` for header/gutter; white code chrome T:80,105,107              |
| Tree/file selection            | yellow `#ffe800` multiply .92 OL:1301–1303,1828                    | sage `#dce8d4`, ink `#2f4a29` T:21–22,97–98                                   |
| Grading annotation/highlight   | `#ffe800`, code highlight .75 OL:1385,1828                         | yellow `#f0d96f`, soft `#fdf9e8`, ink `#655714` T:63–66                       |
| Candidate collaboration/cursor | red `#e8382b`, sheet knockout; red selection 22% OL:1386,1388,1830 | slate `#dbe5ef`, ink `#324860` T:23–24,87–89                                  |
| Assistant identity/activity    | green `#00a95c` OL:1045,1407,1456                                  | sage `#dce8d4`, ink `#2f4a29` T:21–22,90–92, when denoting assistant identity |
| Generic chart ink              | black rules/labels OL:1402,1439,1453                               | `#353638` T:43                                                                |

Preview Read & run / AI assist / Calls colors (OL:1045–1046,1455–1458) and product
planning / execution / edit / steering / idle (T:68–72) have different category
ontologies. There is no safe index/name mapping. Visited-file blue (OL:1312,1329)
has no product counterpart. Global landing chart-1…5 (L:85–89,124–128) likewise
cannot be mapped by position to product models/statuses/activities.

### Earlier shared textured-control recipes

| Same role              | Landing                                                | Product winner                     |
| ---------------------- | ------------------------------------------------------ | ---------------------------------- |
| Ink-on-hover fill      | `#4b4b4d` L:388                                        | `#454545` U:148, T:14              |
| Ink texture            | two gradients: 113° white .09, 119° dark .24 L:389–391 | 116° white 4.5%, 1px/6px U:149–153 |
| Light control label    | `#f5f7fa` L:394                                        | `#f7f7f5` U:154                    |
| Nonflat CTA hover fill | black L:397                                            | `#eceef2` U:172                    |
| CTA hover label        | `rgba(248,250,253,.95)` L:401                          | `#454545` U:184, T:14              |
| CTA hover texture      | white .1 + black .3 gradients L:398–400                | dark 12% + white 50% U:173–183     |

Landing `.inq-row:hover` already matches product light-hover fill and both
gradients (L:407–410, U:172–183). Missing landing hover border/foreground is not
an explicit conflicting value.

### Fonts and stacks: fixed choices take precedence

| Role/location                                  | Landing or historical product disagreement                                                                                                                                  | Release decision                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Global body/sans                               | Newsreader serif in `--font-sans` L:100; candidate Archivo R:25,37                                                                                                          | Archivo body/UI                                                                                                                         |
| Historical prose/serif                         | landing Newsreader L:99; product variable-first Newsreader T:2; toast uses it U:105                                                                                         | Archivo; no legacy `font-serif` export                                                                                                  |
| Global mono stack                              | Spline static, no Menlo L:101 vs product variable-first Spline + Menlo T:3–5, R:26–28                                                                                       | static Spline Sans Mono + ui-monospace/Menlo/monospace, matching installed packages                                                     |
| Active landing mono                            | inline Space Mono C:132, M:86–90,157                                                                                                                                        | Spline Sans Mono                                                                                                                        |
| Token-based mono fallback/usages               | Space Mono O:51,265,333,407,442; OL:514,1124,1282,1321,1686                                                                                                                 | Spline Sans Mono                                                                                                                        |
| Preview avatar, headings, editor tab/code      | hardcoded Space Mono OL:1231,1261,1351,1378                                                                                                                                 | Spline Sans Mono                                                                                                                        |
| Preview timestamps/verdict/chart values/legend | hardcoded Space Mono OL:1409,1428,1449,1467                                                                                                                                 | Spline Sans Mono                                                                                                                        |
| Main CTA family                                | landing Archivo O:106 vs candidate Big Shoulders R:357                                                                                                                      | fixed UI Archivo; display headings Big Shoulders. Riso CTA family is a documented exception to product-wins under the fixed font policy |
| Shared help family                             | inherited Archivo OL:436, O:14 vs Spline R:364–369                                                                                                                          | Spline mono label role                                                                                                                  |
| Shared support footer family                   | Archivo OL:559 vs Spline R:501                                                                                                                                              | Spline for shared support; marketing footer stays separate                                                                              |
| Recruiter preview body                         | Archivo O:14, OL:1183–1190 vs known Newsreader toast-copy U:105                                                                                                             | Archivo; no universal recruiter body declaration exists in supplied files                                                               |
| Replay tooling                                 | system mono/SF Mono/Menlo D:8                                                                                                                                               | Spline if promoted to shared UI; tooling excluded                                                                                       |
| Mixer text/select tooling                      | system mono OL:726–730,912–916                                                                                                                                              | Spline if promoted; tooling excluded                                                                                                    |
| Experimental font alternatives                 | Oswald/Archivo Black; Newsreader/Libre Franklin; Space Mono/Courier Prime/IBM Plex Mono M:22–83,102–144                                                                     | not exported; fixed trio only                                                                                                           |
| Font weight availability                       | product R:6–7 imports Archivo 400/Big Shoulders 900; landing Archivo 500–800 O:88,107,258,326,404,448,455,468; OL:111,327,355,414,435,529,561,1208,1210,1239–1240,1411,1426 | explicit release imports above; no claim of synthetic rendering or inferred imports elsewhere                                           |

### Motion policy disagreements (recipes deferred)

| Same role/policy             | Landing                                                                                                             | Product winner                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OS reduced motion            | intro requires HTML `data-honor-reduced-motion` L:561–598; flight OL:241–245; drawn rules OL:1577–1580              | unconditional OS preference R:766–769, U:49–64                    |
| Main action state motion     | .15s ease transform/shadow, hover/active lift O:115–117,124,130; form OL:373                                        | flat action R:349–361; absent duration is not a numeric conflict  |
| Form reduced-motion handling | plates disable transitions OL:2107–2109,2175–2176 but row lift remains OL:373,403 unless global attribute L:575–582 | no landing field lifts; direct OS policy R:766–769                |
| Preview hover movement       | .28s overshoot; title -6px, button -3px, files +5px, code +4px, verdict -4px, dot 1.25 OL:1889–1903                 | no corresponding product motion; do not import as a shared recipe |

Closing fade, scroll cue, preview transition, and hero-name transition already
honor reduced motion directly (OL:35–39,487–491,1904–1908,1957–1958). Butterfly
wingbeat .3s F:6, swoop .72s OL:158, print feed .55s O:194–200, and L:185–205
reveals do not share the toast/pulse roles and are not duration conflicts.

### Boundaries: not disagreements on the same role

- Active greyscale paper/sheet/ink/ink-2/tint-35/tint-18 match R:12–17. Landing
  card/popover white L:68,70 matches T:7. Sharp radius L:65 matches T:33.
- Landing dark palette L:104–136 has no product dark-mode counterpart. It is
  unsupported parity, not a conflict with product light tokens.
- Landing accent/destructive-foreground L:78–79,81 have no proven same-role
  product equivalents. Do not turn accent red into warning yellow.
- Hero/poster scale O:219,540; OL:272–273,620,640,1713–1715,1873–1878,2040;
  giant art score O:356–357,393; preview review title OL:1243 are different
  screen/marketing roles, not product title/timer sizes.
- Butterfly passes O:171–211, OL:148–255,2313–2335, F:1–6; rough display art
  OL:1593–1657,1817–1819,1848–1853; alternate drums/stocks S:17–42,216–360;
  footer color art OL:1930–1933, S:133–136; registration geometry
  OL:1134–1160,1660–1665; halftone bands OL:1262–1264,1667–1791,1805–1806,2338
  remain concept-only. Warm-red hero ink C:28–29 may remain art, but cannot
  replace the shared yellow highlight role.
- Replay pill D:7–13 (999px radius, blur 12px); mixer OL:720–730 (14px radius,
  blur 14px); tooling buttons/selects OL:797–815,854–869,903–916,950–959
  (7px/6px radii); tooling warning OL:943–948 (`#fff0b3`/`#5c4b00`) are not
  product controls/dialogs/statuses. Preview avatar OL:1228 has no product
  counterpart. Rounded registration circles are geometry, not controls.
- Historical flourishes L:155–266,300–380,413–461,474–559 and soft marketing
  shadows L:302–310,463–469 are not toast or ink-control roles. Product toast
  radius 10px U:37 does not imply rounded buttons; landing derived radii
  L:22–28 do not have a matching product radius scale.
- Superseded frosted navigation OL:69–70 becomes opaque/no blur OL:1501–1503;
  final form/sheet shadows are OL:2260–2275,2295–2310. Earlier overridden
  recipes are not additional active conflicts.
- Product-only toast surfaces U:80–100, syntax colors U:220–258, most grading
  status/model colors T:52–79, and change/deletion T:99–104 have no matching
  landing roles. `--canvas-grid`/`--canvas-grid-size` are referenced U:3–4 but
  not defined in these sources; no values were invented.

This audit is source-based, not a computed-style/browser audit. Absence of a
declaration is not a conflicting literal; conditional role matches are labeled.
