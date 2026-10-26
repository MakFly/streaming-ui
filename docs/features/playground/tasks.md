# Tasks - Playground

- **Slug:** playground
- **Design:** [design.md](design.md)

Each task must be independently testable and leave the codebase working.

- [x] **T1** - Kit hooks for the playground
  - Covers: AC-1.2, AC-2.1, AC-4.1
  - Files: `src/templates/kit/thinking-style.tsx`, `src/components/composers/composer-thread-demo.tsx`, `src/templates/kit/composer-variant.tsx`, `src/components/composers/install-button.tsx`
  - Done when: `ThinkingStyleScope` overrides the style inside it only; `ComposerThreadDemo modelPicker={false}` renders no picker; a forced `?composer=` survives a storage event; `CopyLine` and `PMS` are exported; /composers unchanged; `tsc -b` green
- [x] **T2** - Playground state
  - Covers: AC-1.3, AC-5.1, AC-5.3, AC-6.1
  - Files: `src/components/playground/state.ts`
  - Done when: parsing an empty, a full and a partly bad query gives the expected state; `shuffle` never returns the same combination; `installItems` lists exactly the picked items
- [ ] **T3** - Controls pane
  - Covers: AC-1.1, AC-1.2
  - Files: `src/components/playground/controls.tsx`
  - Done when: every group changes the state and shows the current value; keyboard reachable
- [ ] **T4** - Responses lab
  - Covers: AC-3.1, AC-3.2, AC-3.3, AC-7.3
  - Files: `src/components/playground/responses-lab.tsx`
  - Done when: search, collection filter, empty message and Replay work; the stage plays the picked response
- [ ] **T5** - Template view
  - Covers: AC-4.1, AC-4.2
  - Files: `src/components/playground/template-view.tsx`
  - Done when: the iframe wears the picked composer and thinking style; device switch resizes it; site-wide choices untouched
- [ ] **T6** - Install popover
  - Covers: AC-5.2
  - Files: `src/components/playground/install.tsx`
  - Done when: the commands match the combination; Copy one and Copy all work
- [ ] **T7** - Page, layout and shortcut
  - Covers: AC-1.1, AC-1.3, AC-2.2, AC-2.3, AC-5.1, AC-6.1, AC-6.2, AC-7.1
  - Files: `src/routes/playground-page.tsx`
  - Done when: three panes at ≥ 1280px, two at 1024–1279px, tabs below 1024px; Share copies the link; `R` shuffles except while typing
- [ ] **T8** - Route, nav, ⌘K, SEO
  - Covers: AC-7.2
  - Files: `src/router.tsx`, `src/lib/paths.ts`, `src/components/site-nav.tsx`, `src/components/command-palette.tsx`, `src/seo/routes.ts`
  - Done when: /playground reachable from the nav and ⌘K, in `STATIC_PAGES`; header still fits at 1024px and 1280px

## Notes

- **Redirected mid-QA (2026-10-25)**: at the user's request the layout now follows assistant-ui's playground (UI
  Builder) instead of the three-pane page of design.md: full-screen route outside the site layout, a 48px header with a
  Chat / Template / Response canvas switch, a settings sidebar (Preset, Composer, Thinking, Template, Response, Colors)
  and a canvas with a device toolbar (Desktop / Tablet / Mobile, drag handles, `vw` in the URL), New Thread, Share,
  Code (chat.tsx / install.sh) and Install. The responses lab, the template view and the install popover are replaced
  by the canvas views and the Code view (`src/components/playground/{ui,sidebar,canvas,state}`). T3–T7 above describe
  the replaced layout; the route also moved outside the site layout (no site nav), like /preview.
- Surprise me has no button any more (none on the target); the `R` shortcut stays.
- The device value for phones is `mobile` (the BrowserFrame / target name), not `phone`.
- Found while testing: ComposerThreadDemo never replayed its intro after StrictMode's test unmount (busy stuck on
  Stop in dev); fixed by resetting `played` on unmount. It affected /composers in dev too.
- During the first scripted QA the URL once switched from `composer=dock` to `composer=box` with no click on Box. Not
  reproduced in the full QA below (dozens of composer changes); attributed to that test script.

## QA (2026-10-25, cloned layout)

Browser preview at 375, 768, 1024, 1280 and 1440px, light and dark. Typecheck green, registry rebuilt.

| AC | Result |
|----|--------|
| 1.1 Change composer / thinking / palette / theme live, thread kept | Pass |
| 1.2 Model picker in / out of the model slot | Pass on all 11 composers, after fix 1 |
| 1.3 Defaults (Pill, picker on, dots, intro playing, clean URL) | Pass |
| — Presets (Terminal, Studio…) apply and are recognised; "Custom" otherwise | Pass |
| 2.1 Send: bubble, thinking indicator in the scoped style (orb), streamed answer | Pass; site-wide `tpl-thinking` untouched |
| 2.2 Stop button and Esc freeze the answer, composer ready again | Pass |
| 2.3 Composer switched mid-answer: the answer completes | Pass |
| 3.1 Pick a response: canvas switches to it, it plays, Replay | Pass, after fix 2 |
| 3.2 Collection filter | Pass (24 responses in Tool cards) |
| 3.3 Search with no match | Replaced: the cloned sidebar picks from a collection, there is no free search |
| 4.1 Template wears the composer and thinking style, site-wide choice untouched | Pass (`/preview/…?composer=&thinking=`) |
| 4.2 Device switch and drag handles resize the frame | Pass (`vw` in the URL, 768 / 390 / dragged 912) |
| 5.1 Share link round trip (incl. palette and theme, then removed from the URL) | Pass |
| 5.2 Install lists exactly the picked items | Pass (`composer-dock`, `model-picker`, `thinking-orb`) |
| 5.3 Bad values fall back one by one | Pass (`model=nope`, `view=zzz`) |
| 6.1 `R` re-rolls everything | Pass |
| 6.2 `r` while typing does nothing | Pass |
| 7.1 No horizontal scroll 375–1440, light and dark | Pass, after fixes 3 and 4 |
| 7.2 Site nav (6 links at 1024, 8 at 1280), ⌘K, SEO | Pass; header fits at both |
| 7.3 Only what is visible animates | Pass by construction (DemoStage stops off-screen; one preview at a time) |
| Regression: /composers demos keep their own anatomy (Box without picker) | Pass |

Fixes made during this QA:
1. Box, Dock and Command never showed the picker: `ComposerThreadDemo modelPicker={true}` now forces it into every model slot (unset keeps /composers as it was).
2. No Replay for responses: the toolbar's first button restarts the preview in every view (New Thread / Reload / Replay).
3. Toolbar overflowed at 768px (Code and Install cut off): icons only between md and lg, with titles and labels for screen readers.
4. Response stage clipped inside the 375px frame: stage padding `p-2` below md.
