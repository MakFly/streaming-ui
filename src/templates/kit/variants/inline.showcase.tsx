import { type ReactNode } from 'react';
import type { ComposerExtension, CompareRow } from '../variant-types';
import type { Script } from '../engine';

import { InlineComposerView } from './inline';

/* The /composers showcase for Inline: picker glyph, scripted demo, spec sheet and comparison cells. */

function InlineGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute top-0.5 left-1 h-0.5 w-9 rounded bg-accent-500/40" />
      <span className="absolute inset-x-0 top-2 h-[18px] rounded-[5px] border border-border-button-default bg-background-primary-default shadow-xs" />
      <span className="absolute top-[13px] left-1 size-2 rounded-[2px] bg-accent-500" />
      <span className="absolute top-[13px] left-[14px] h-2 w-3 rounded-[2px] bg-background-tertiary-default" />
      <span className="absolute top-[16px] left-[30px] h-0.5 w-2.5 rounded bg-text-tertiary/50" />
      <span className="absolute top-[13px] right-1 size-2 rounded-[2px] bg-text-primary" />
      <span className="absolute inset-x-2 bottom-1 border-t border-dashed border-separator-border" />
    </span>
  );
}

/* ------------------------------------------------------------------ demo */

const intro: Script = async (api) => {
  await api.sleep(500);
  await api.user('Rewrite “we will try to ship it soon, hopefully” so it sounds confident', { type: true });
  const a = api.assistant();
  await a.think('Editing', ['Reading the selected sentence', 'Keeping the meaning, dropping the hedges'], 550);
  await a.stream(
    `Suggested edit:

> ~~we will try to ship it soon, hopefully~~
> **We ship it on Thursday.**

- Dropped *try* and *hopefully*: they promise less than you mean.
- A day beats *soon*; swap in the real date before you send it.

Press **Tab** to accept, or select another sentence and **⌘K** again.`,
    26,
  );
  a.done();
};

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

const compare: Record<CompareRow, ReactNode> = {
  Input: 'Single line + selection chip',
  'Shift+Enter newline': NO,
  'Model slot': 'In the bar, small (sm and up)',
  'Tools slot': 'Row under the bar',
  'Built-in tools': 'Selection chip, attach',
  'Status placement': 'Under',
  Modes: 'Edit / Ask segment',
  'Slash commands': NO,
  'Busy indicator': 'Spinner glyph',
  'Stop control': 'Stop button, esc hint',
  'Esc to stop': YES,
  'Best width': 'Narrow, over content',
};

export const inline: ComposerExtension = {
  Component: InlineComposerView,
  Glyph: InlineGlyph,
  demo: {
    intro,
    suggestions: ['Make it even shorter', 'Ask why it works', 'Try a friendlier tone'],
    content: ({ picker, count }) => ({
      model: picker,
      placeholder: 'Select text, then ⌘K to edit it',
      status: (
        <>
          <span>Select any text in the thread first</span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Edits stay inline'}</span>
        </>
      ),
    }),
  },
  spec: {
    anatomy: ['Sparkle glyph (spinner while busy)', 'Selection chip, removable (“No selection” otherwise)', 'Single-line input', 'Edit / Ask segment', 'Model slot (small, sm and up)', 'Send / Stop', 'Key-hint row with attach', 'Tools row and status under the bar'],
    behaviour: [
      { keys: ['⌘', 'K'], text: 'focuses the bar from anywhere (Ctrl+K off Mac)' },
      { keys: ['↵'], text: 'submits in the current mode' },
      { keys: ['⌥', '↵'], text: 'switches to Ask and submits' },
      { keys: ['Tab'], text: 'on an empty field, accepts the suggested instruction' },
      { keys: ['Esc'], text: 'stops while busy, else drops the chip, else leaves the bar' },
      { keys: null, text: 'The last text selected outside the bar becomes the chip and is sent as a > quote above the instruction. Busy: a spinner replaces the glyph.' },
    ],
    bestFor: 'Editing or questioning a specific passage in place: docs, editors, code views. One line, so not for long prompts.',
    usage: `<Composer
  variant="inline"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Select text, then ⌘K to edit it"
  model={<ModelPicker value={model} onChange={setModel} />}
/>`,
  },
  compare,
};
