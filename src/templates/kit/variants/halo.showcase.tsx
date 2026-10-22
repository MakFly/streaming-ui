import { Sparkles } from 'lucide-react';
import type { ComposerExtension, DemoContext } from '../variant-types';
import type { Script } from '../engine';

import { HaloComposerView } from './halo';

/* The /composers showcase for Halo: picker glyph, scripted demo, spec sheet and comparison cells. */

/* ------------------------------------------------------------------ glyph */

function HaloGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span
        className="absolute inset-0.5 rounded-lg opacity-40 blur-[3px]"
        style={{ background: 'conic-gradient(from 200deg, var(--color-text-primary), transparent 35%, transparent 55%, var(--color-text-primary) 80%, var(--color-text-primary))' }}
      />
      <span
        className="absolute inset-1 rounded-[7px] p-px"
        style={{ background: 'conic-gradient(from 200deg, var(--color-text-primary), transparent 35%, transparent 55%, var(--color-text-primary) 80%, var(--color-text-primary))' }}
      >
        <span className="block size-full rounded-[6px] bg-background-primary-default" />
      </span>
      <span className="absolute top-[9px] left-2.5 h-0.5 w-5 rounded bg-text-tertiary/50" />
      <span className="absolute top-[7px] left-[31px] h-1.5 w-px bg-text-tertiary" />
      <span className="absolute bottom-2 left-2.5 size-1.5 rounded-full bg-violet-500/70" />
      <span className="absolute right-2.5 bottom-2 size-2 rounded-full bg-text-primary" />
    </span>
  );
}

/* ------------------------------------------------------------------ demo */

const intro: Script = async (api) => {
  await api.sleep(1800);
  await api.user('Plan a 3-day trip to Kyoto in autumn. Context: first visit, I like quiet temples and good food. Format: one line per day, then two tips.', { type: true });
  const a = api.assistant();
  await a.think('Thinking', ['Picking the autumn-leaf spots', 'Balancing temples with food stops'], 600);
  await a.stream(
    `A calm first visit, one district per day:

- **Day 1 · East** — Kiyomizu-dera at opening time, then the lanes of Sannenzaka and dinner in Gion.
- **Day 2 · North** — Eikan-dō and the Philosopher's Path, lunch near Ginkaku-ji, tofu at Nanzen-ji.
- **Day 3 · West** — Arashiyama bamboo early, Tenryū-ji gardens, and Nishiki Market on the way back.

Two tips: book a **kaiseki** dinner a week ahead, and use a day bus pass to save on short hops.`,
    26,
  );
  a.done();
};

const content = ({ picker, count }: DemoContext) => ({
  placeholder: 'Ask anything',
  model: picker,
  status: (
    <>
      <span className="flex items-center gap-1">
        <Sparkles /> Enhance turns a draft into a full prompt
      </span>
      <span className="tabular-nums">{count ? `${count} messages` : 'Examples cycle while empty'}</span>
    </>
  ),
});

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

export const halo: ComposerExtension = {
  Component: HaloComposerView,
  Glyph: HaloGlyph,
  demo: {
    intro,
    suggestions: ['Make it a 5-day trip', 'Where should I stay?', 'Enhance: what to pack'],
    content,
  },
  spec: {
    anatomy: [
      'Glowing conic rim + blurred glow behind it',
      'Attachment strip',
      'Growing textarea with a typed, cycling placeholder',
      'Add button',
      'Enhance button (rewrites the draft)',
      'Tools slot',
      'Model slot',
      'Send / Stop',
      'Status line under the card',
    ],
    behaviour: [
      { keys: ['Enter'], text: 'sends: the text dissolves into drifting characters (~0.5s), then the message leaves' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Esc'], text: 'stops while busy' },
      { keys: null, text: 'Empty field: example prompts are typed letter by letter, held, then erased. Enhance on an empty field starts from the example on show.' },
      { keys: null, text: 'Rim: calm at rest, full on focus, spinning fast and bright while busy. Reduced motion: still rim, prompts swap whole, no vanish.' },
    ],
    bestFor: 'Landing and empty states that should invite a first prompt: the moving rim and typed examples teach what to ask, Enhance helps short drafts.',
    usage: `<Composer
  variant="halo"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask anything"
  model={<ModelPicker value={model} onChange={setModel} />}
  status={
    <>
      <span><Sparkles /> Enhance turns a draft into a full prompt</span>
      <span>{count} messages</span>
    </>
  }
/>`,
  },
  compare: {
    Input: 'Growing textarea',
    'Shift+Enter newline': YES,
    'Model slot': 'Action row, right',
    'Tools slot': 'After Enhance',
    'Built-in tools': 'Add, Enhance',
    'Status placement': 'Under',
    Modes: NO,
    'Slash commands': NO,
    'Busy indicator': 'Glow up',
    'Stop control': 'Stop button',
    'Esc to stop': YES,
    'Best width': 'Hero / empty state',
  },
};
