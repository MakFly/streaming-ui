# Technical Design - Playground

- **Slug:** playground
- **Date:** 2026-10-25
- **Status:** Approved (2026-10-25)
- **Spec:** [spec.md](spec.md)

## Impact analysis

| Area | Files / modules | Change |
|------|-----------------|--------|
| Route | `src/routes/playground-page.tsx` | **New** page, `PlaygroundPage` |
| Playground parts | `src/components/playground/*` | **New**: state hook, controls, responses lab, template view, install popover |
| Routing | `src/router.tsx`, `src/lib/paths.ts` | New `/playground` route, `paths.playground()`, prefetch list, route comment |
| Nav / search / SEO | `src/components/site-nav.tsx`, `src/components/command-palette.tsx`, `src/seo/routes.ts` | "Playground" link, ⌘K entry, `PLAYGROUND` meta in `STATIC_PAGES` (sitemap and prerender follow) |
| Composer thread demo | `src/components/composers/composer-thread-demo.tsx` | New optional `modelPicker` prop (default `true`), so the picker can leave the composer |
| Thinking style | `src/templates/kit/thinking-style.tsx` | New `ThinkingStyleScope` provider: `useThinkingStyle` returns its value when set, so the playground's chat shows its own style without writing the site-wide one |
| Install | `src/components/composers/install-button.tsx` | Export the existing `CopyLine` and `PMS` (package managers) for the multi-command install popover |
| Template preview | `src/routes/template-preview.tsx`, `composer-variant.tsx` | None in behaviour: `?composer=` and `?thinking=` overrides already exist. One fix: a forced `?composer=` must ignore later storage events (today a site-wide change overwrites it) |
| Theme | `src/providers/theme-provider.tsx` | None. Palette and theme stay global (spec assumption); same-origin template iframes already follow them through storage |

## Proposed solution

### Overview

One page, three panes, all driven by a single state object mirrored in the URL:

```
┌ Controls (280) ─┬ Chat (flex) ────────────────────┬ Responses (420) ┐
│ Composer  ×11   │ [Chat | In a template]          │ search          │
│ Model picker ⏻  │  ComposerThreadDemo             │ collection chips│
│ Thinking  ×10   │   or BrowserFrame(/preview/…)   │ list (249)      │
│ Palette ×4 Theme│                                 │ DemoStage       │
│ Surprise · Share · Install                         │                 │
└─────────────────┴─────────────────────────────────┴─────────────────┘
```

- **≥ 1280px**: the three panes side by side, chat sticky.
- **1024–1279px**: controls | chat; the responses lab drops below the chat at full width.
- **< 1024px**: one pane at a time behind a segmented control (Build / Chat / Responses).

The chat is the existing `ComposerThreadDemo` (the /composers thread): it already keeps its conversation when the
variant prop changes, runs a scripted intro per composer and answers what you type. The responses stage is the
gallery's `DemoStage`. The template view is the template page's `BrowserFrame` pointed at `/preview/<slug>` with
URL overrides. Almost everything is reuse; the new code is the state, the controls and the layout.

### Components

- **`usePlaygroundState`** (`src/components/playground/state.ts`) - the combination: `{ composer, model, thinking,
  response, view, template, device }`. Reads it from the URL on mount (unknown values fall back one by one), writes
  it back with `replace` on every change (`useSearchParams`), so the address bar is always the share link.
  Palette and theme come from `useTheme()`; a link's `palette`/`theme` are applied once on mount. Also exports
  `shuffle(current)` (re-rolls until the combination differs) and `installItems(state)`.
- **`PlaygroundControls`** (`controls.tsx`) - the left pane: composer grid (11 tiles with their name and `from`),
  model picker switch, thinking style (dots + 9 orbs as small live orbs), palette swatches, theme switch, then
  Surprise me / Share / Install. Each group is a `radiogroup`.
- **`ResponsesLab`** (`responses-lab.tsx`) - search field, collection chips (`libraries`), the matching list from
  `demos` (filtered with the existing `searchText`), and a `DemoStage` for the picked one with Replay. Only the
  stage plays (DemoStage already stops off-screen).
- **`TemplateView`** (`template-view.tsx`) - template select (10, from `templates`), device switch
  (desktop / tablet / phone), `BrowserFrame src={/preview/<slug>?composer=<id>&thinking=<style>}`.
- **`InstallPopover`** (`install.tsx`) - the commands for `installItems(state)`, package manager tabs, Copy one /
  Copy all, the tokens import line. Reuses `CopyLine`.
- **`PlaygroundPage`** (`src/routes/playground-page.tsx`) - header, layout, `R` shortcut (ignored while focus is in
  an input, textarea or contenteditable), `ThinkingStyleScope` around the chat, `applyHead(PLAYGROUND)`.

### Data model

None persisted. URL parameters (all optional):

| Param | Values | Default |
|-------|--------|---------|
| `composer` | the 11 variant ids | `pill` |
| `model` | `on` / `off` | `on` |
| `thinking` | `dots` + the 9 orb states | `dots` |
| `response` | any demo slug | first demo of the Agent collection |
| `view` | `chat` / `template` | `chat` |
| `template` | the 10 template slugs | `assistant` |
| `device` | `desktop` / `tablet` / `phone` | `desktop` |
| `palette`, `theme` | the 4 palettes; `light` / `dark` | the site's current ones (applied on mount only) |

### API / interfaces

```ts
// thinking-style.tsx
export function ThinkingStyleScope(props: { value: ThinkingStyle; children: ReactNode }): JSX.Element;
// useThinkingStyle(): the scope's value when inside one, else the shared choice (unchanged).

// composer-thread-demo.tsx
ComposerThreadDemo({ variant, active, className, modelPicker = true })

// playground/state.ts
type PlaygroundState = { composer: ComposerVariant; model: boolean; thinking: ThinkingStyle; response: string;
  view: 'chat' | 'template'; template: string; device: Device };
function usePlaygroundState(): [PlaygroundState, (patch: Partial<PlaygroundState>) => void];
function shuffle(s: PlaygroundState): Partial<PlaygroundState>;   // composer, thinking, response (+ palette, theme by the caller)
function installItems(s: PlaygroundState): string[];              // ['composer-pill', 'model-picker', 'thinking-orb']
```

### Main flows

1. **Open** - `/playground?…` → state parsed, palette/theme applied if given → chat mounts and plays the
   composer's intro → the responses stage plays the picked response.
2. **Change a piece** - control → `set(patch)` → URL replaced → the chat re-renders with the new variant /
   thinking scope; its messages and any running stream are kept (AC-2.3).
3. **Send** - handled by `ComposerThreadDemo` (`useChatEngine`): user bubble, `ThinkingIndicator` in the scoped
   style, streamed reply, Stop / Esc.
4. **Template view** - `view=template` → the chat pane shows `BrowserFrame`; its `src` changes with composer /
   thinking, which reloads the iframe (acceptable: a template is a fresh app).
5. **Share** - copy `location.href` (it is already the full state, plus the current palette and theme added).
6. **Surprise me / R** - `shuffle` + a random palette and theme → one `set` → everything updates at once.

## Alternatives considered

| Option | Why rejected |
|--------|--------------|
| Write the playground's choices to the site-wide composer / thinking storage | Rejected at gate 1: the playground must not change what the templates show elsewhere |
| A new chat built from `Composer` + `useChatEngine` | Duplicates `ComposerThreadDemo`, which already has per-composer intros, replies, tools and status lines |
| Play the chosen response *inside* the chat's answer | The 249 responses are imperative DOM scripts owning their stage; embedding them in a React message would need a bridge per demo. A stage beside the chat gives the same comparison |
| Keep state in React only, with a "Copy link" that serialises it | The URL as the source of truth makes Back/Forward, reload and sharing work for free |
| A palette override for the template iframe | Not needed: palette and theme are global by the spec, and same-origin iframes already follow them |

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Three live surfaces at once (chat stream, responses stage, orbs in the thinking picker) cost CPU | Medium | DemoStage already stops off-screen; the orb tiles render paused except the selected one (`ThinkingOrb paused`); one chat only |
| `R` shortcut fires while typing | Medium | Ignore when `event.target` is an input / textarea / contenteditable or a modifier is held; tested by AC-6.2 |
| Forced `?composer=` in the iframe overwritten by a storage event from another tab | Low | Small fix in `ComposerVariantProvider`: a forced value ignores storage events |
| URL churn: every click adds history entries | Low | `setSearchParams(…, { replace: true })` |
| The header still has to fit an 8th link ("Playground") at 1024px | Medium | Measure after adding; if it overflows, "Models" joins the `wide` (≥ xl) links |
| Changing the variant mid-stream breaks the engine | Low | The engine lives in `ComposerThreadDemo` above the variant; verified by AC-2.3 in the browser |

## Test strategy

- **Unit:** the project has no test runner. Pure functions (`parse`, `shuffle`, `installItems`) stay small and are
  checked from the browser console during QA.
- **Integration:** `tsc -b` and `npm run registry:build` (unchanged registry, must stay green).
- **Manual / E2E:** every AC of the spec in the browser preview at 375, 1024, 1280 and 1440px, light and dark:
  share link round-trip, bad link fallback, Stop / Esc, switch mid-stream, `R` in and out of the field, no
  horizontal scroll, no console errors.
