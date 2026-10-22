<div align="center">

# Streaming UI

**Every way an AI response can arrive.**

227 live streaming, thinking and agent patterns · 10 complete AI chat templates · 11 composers you can install with the shadcn CLI.

[![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn registry](https://img.shields.io/badge/shadcn-registry-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/docs/registry)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Streaming UI landing page](docs/landing.png)

</div>

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Install a composer in your project](#install-a-composer-in-your-project)
- [What's inside](#whats-inside)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [Credits and license](#credits-and-license)

## Features

- **227 response patterns, playing live.** Reasoning blocks, shimmering status lines, tool calls, web search trails, task lists, skeletons, dot-grid loaders, approval cards and full agent timelines, sorted into 14 collections. Every card plays on screen and stops off screen.
- **A rebuild prompt for everything.** Each demo, template and composer opens a Markdown prompt with the exact choreography, timings and source files, ready to paste into an AI coding assistant.
- **10 AI chat templates.** Assistant, Research, Coding Agent, Support Copilot, Data Analyst, Agent Builder, Canvas, Deep Research, Agent Approvals and Model Compare. Each one plays a scripted conversation, then answers what you type, with a desktop / tablet / mobile preview.
- **11 interchangeable composers.** Pill, Box, Panel, Dock, Command, Inline, Voice, Halo, Media, Palette and Mention, all behind one `<Composer variant="…" />` API. Pick one for every template at once from any header.
- **A shadcn registry.** Every composer, the shared kit, the model picker and the design tokens install into your own project with one `npx shadcn add` command.
- **Light and dark, four palettes.** Graphite, Dusk, Slate and Sand swap the neutral and accent scales of the whole UI; the choice follows into every live preview.
- **Built for real use.** Real dictation (Web Speech API, with a fallback), attachments with upload rings, a model picker with effort levels and fast mode, a context ring with usage limits, keyboard support everywhere.

<table>
  <tr>
    <td width="50%"><img src="docs/templates.png" alt="Chat templates gallery" /></td>
    <td width="50%"><img src="docs/assistant.png" alt="Assistant template, full window" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Chat templates, each thumbnail is the live app</sub></td>
    <td align="center"><sub>The Assistant template, full window</sub></td>
  </tr>
</table>

## Quick start

Requires Node.js 20 or later.

```bash
git clone https://github.com/MakFly/streaming-ui.git
cd streaming-ui
npm install
npm run dev
```

Open <http://localhost:5173>.

## Install a composer in your project

The composers are published as a [shadcn registry](https://ui.shadcn.com/docs/registry) from `public/r/`. In any project set up with shadcn (React + Tailwind CSS v4):

```bash
# one composer, with the kit and tokens it needs
npx shadcn@latest add https://<your-deployment>/r/composer-pill.json

# all eleven behind one <Composer variant="…" /> switch
npx shadcn@latest add https://<your-deployment>/r/composer.json
```

Then import the tokens once in your global CSS, after Tailwind:

```css
@import "tailwindcss";
@import "./styles/streaming-ui.css";
```

And use it:

```tsx
import { useState } from 'react';
import { PillComposer } from '@/components/composer/variants/pill';

export function Chat() {
  const [draft, setDraft] = useState('');
  return <PillComposer value={draft} onChange={setDraft} onSend={(text) => { /* send */ setDraft(''); }} context={42} />;
}
```

The registry items point at each other by URL. Build them for the address you deploy to:

```bash
REGISTRY_URL=https://your-site.example npm run registry:build
```

| Item | What you get |
| --- | --- |
| `composer-pill` … `composer-mention` | One composer each (`PillComposer`, `BoxComposer`, …), standalone |
| `composer` | All eleven behind `<Composer variant="…" />`, plus the provider that swaps them everywhere |
| `composer-kit` | The shared props contract, field behaviour, buttons, dictation, status line, context ring, attachments |
| `composer-theme` | The design tokens as one stylesheet (`styles/streaming-ui.css`) |
| `model-picker` | Providers, effort slider with the Max effect, fast mode |

## What's inside

| Route | Page |
| --- | --- |
| `/` | Landing page: live showcase, collections, catalogue, prompts, an interactive composer |
| `/responses` | The gallery, every collection (`?q=` search, `?view=list`) |
| `/responses/library/:collection` | One collection, e.g. `/responses/library/agent` |
| `/demo/:slug` | One response on its own page |
| `/templates` | The 10 chat templates, each thumbnail live |
| `/templates/:slug` | Template page: preview or code, device switcher, live preview, copy prompt |
| `/composers` | The 11 composers, each in its own live thread, with spec, comparison, Prompt and Install |
| `/preview/:slug` | A bare template, full window (what the previews load) |

Every page with a Prompt has a matching `…/prompt` URL that opens it directly.

## Project structure

```
src/
  main.tsx                 providers (theme + palette, playback, tooltips) + router
  router.tsx               route tree, each page lazy-loaded and prefetched while idle
  routes/                  landing, gallery, demo, templates, template, composers, preview, prompt, 404
  components/              site chrome, demo stage, prompt dialog, palette picker, install button, shadcn ui/
  engine/                  the 227 response demos (imperative DOM choreographies) and their registry
  templates/               the 10 chat templates
    kit/                   the chat kit: engine, markdown, parts, model picker, attachments, limits
      composer-kit.tsx     props contract and shared composer behaviour
      composers.tsx        <Composer variant="…" /> switch
      variants/            one file per composer (+ *.showcase.tsx for the /composers page)
  styles/                  theme, typography, palettes, globals, scrollbars, per-collection scopes
public/
  r/                       the built shadcn registry (npm run registry:build)
  sources/                 original registry sources, used to build the demo prompts
scripts/                   build-registry.mjs, collect-classes.mjs
legacy/                    the earlier vanilla build, kept for reference
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on <http://localhost:5173> |
| `npm run build` | Typecheck, then production build in `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run typecheck` | `tsc -b` only |
| `npm run registry:build` | Write `registry.json`, bundle the tokens, run `shadcn build` into `public/r/` |

## How it works

- **Demos.** Each of the 227 demos follows one contract, `{ group, title, desc, kind, run(root, t, ctx) }`. React owns the stage element; the demo owns what is inside it. `t` is a timer scope, so clearing it stops everything a demo scheduled.
- **Prompts.** A demo's prompt is rebuilt from `run.toString()` and the helpers it uses, so the production build keeps the code as authored: no minification, `esnext` target, no tree-shaking (see `vite.config.ts`).
- **Templates.** `templates/kit/engine.ts` runs async scripts (think, call tools, stream markdown, ask for approval) as React state. A new message or Stop cancels whatever is playing.
- **Theme and palettes.** Dark mode is a `.dark` class on `<html>`; a palette is a `data-palette` attribute that swaps the `--color-neutral-*` and `--color-accent-*` scales every semantic token is built from. Both are applied before first paint and synced across tabs and preview frames.
- **Performance.** Pages are code-split and prefetched when the browser is idle; template thumbnails boot two at a time behind a skeleton.

## Contributing

Issues and pull requests are welcome.

1. Fork the repository and create a branch.
2. `npm install`, then `npm run dev`.
3. Keep `npm run build` passing (it typechecks first).
4. New composer: add `src/templates/kit/variants/<id>.tsx` (+ `<id>.showcase.tsx`), register it in `variants/index.ts` and `composer-variant.tsx`, then run `npm run registry:build`.
5. New template: add `src/templates/<name>.tsx` with a default export and register it in `src/templates/registry.ts`.

## Credits and license

Streaming UI is released under the [MIT License](LICENSE).

Parts of the code are adapted from open-source projects, each under its own license. Their notices are kept in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
