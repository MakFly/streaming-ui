import { type ReactNode } from 'react';
import { Command } from 'lucide-react';
import type { ComposerExtension } from '../variant-types';

import { PaletteComposerView } from './palette';

/* The /composers showcase for Palette: picker glyph, scripted demo, spec sheet and comparison cells. */

/* ------------------------------------------------------------------ glyph, demo, spec */

function PaletteGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default shadow-xs" />
      <span className="absolute top-[6px] left-[7px] size-1.5 rounded-full border border-text-tertiary" />
      <span className="absolute top-[7px] left-[15px] h-0.5 w-5 rounded bg-text-tertiary/50" />
      <span className="absolute top-[5px] right-[6px] h-1.5 w-2.5 rounded-full bg-background-tertiary-default" />
      <span className="absolute inset-x-0.5 top-[13px] border-t border-separator-border" />
      <span className="absolute top-[16px] inset-x-[5px] h-[5px] rounded-[2px] bg-background-tertiary-default" />
      <span className="absolute top-[17.5px] left-[7px] size-0.5 rounded-full bg-accent-500" />
      <span className="absolute top-[24px] left-[7px] h-0.5 w-6 rounded bg-text-tertiary/35" />
    </span>
  );
}

const intro: ComposerExtension['demo']['intro'] = async (api) => {
  await api.sleep(500);
  await api.user('Fix grammar: their going to announce the new pricing tommorow, so lets wait', { type: true });
  const a = api.assistant();
  await a.think('Proofreading', ['Spotting spelling and agreement errors'], 550);
  await a.stream(
    `> **They're** going to announce the new pricing **tomorrow**, so **let's** wait.

- *their* → **they're** (they are)
- *tommorow* → **tomorrow**
- *lets* → **let's** (let us)`,
    26,
  );
  a.done();
};

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;
const Tag = ({ children }: { children: ReactNode }) => <span className="inline-flex h-5 items-center rounded-md bg-accent-500/10 px-1.5 text-caption-1-medium text-accent-500">{children}</span>;

export const palette: ComposerExtension = {
  Component: PaletteComposerView,
  Glyph: PaletteGlyph,
  demo: {
    intro,
    suggestions: ['Translate to French', 'Draft a reply to the team', 'Summarize thread'],
    content: ({ picker, count }) => ({
      model: picker,
      placeholder: 'Ask AI or search commands…',
      status: (
        <>
          <span className="flex items-center gap-1">
            <Command /> K for actions
          </span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Tab hands the query to AI'}</span>
        </>
      ),
    }),
  },
  spec: {
    anatomy: ['Search row: icon, single-line query, model slot (Stop while busy)', 'Attachment strip', 'List (opens on focus, ~5 rows, scrolls): Ask AI · query, Commands, Recent', 'Actions list for the active row (⌘K)', 'Action bar: Quick AI label · Ask AI Tab · Run ↵ · Actions ⌘K', 'Tools row under the palette', 'Status line under the palette'],
    behaviour: [
      { keys: ['↑', '↓'], text: 'move the active row (aria-activedescendant); hover does too' },
      { keys: ['↵'], text: 'runs the active row: Ask AI sends the query, a command sends “Command: query” (its canned prompt when the field is empty or the query names it)' },
      { keys: ['Tab'], text: 'always sends the raw query to AI' },
      { keys: ['⌘', 'K'], text: 'swaps the list for the active row’s actions: run, ask AI, edit in the field, attach, clear' },
      { keys: ['esc'], text: 'stops while busy; otherwise closes actions, then clears the query' },
      { keys: null, text: 'Busy: the list folds away and Stop replaces the model. The list folds when the field is empty and unfocused.' },
    ],
    bestFor: 'Launchers, spotlight overlays and ⌘K entry points, where one query either runs a canned command or goes straight to AI.',
    usage: `<Composer
  variant="palette"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask AI or search commands…"
  model={<ModelPicker value={model} onChange={setModel} />}
  context={context}
  status={
    <>
      <span><Command /> K for actions</span>
      <span>{count} messages</span>
    </>
  }
/>`,
  },
  compare: {
    Input: 'Single-line search',
    'Shift+Enter newline': NO,
    'Model slot': 'Search row, right',
    'Tools slot': 'Row under the palette',
    'Built-in tools': 'Commands, recents, attach (⌘K)',
    'Status placement': 'Under',
    Modes: NO,
    'Slash commands': <Tag>5 commands, no slash</Tag>,
    'Busy indicator': 'List folds, Stop button',
    'Stop control': 'Stop button + esc chip',
    'Esc to stop': YES,
    'Best width': 'Centred overlay, 560–720px',
  },
};
