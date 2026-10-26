import { type CSSProperties, type ReactNode } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Script } from '../engine';
import type { ComposerExtension } from '../variant-types';

import { VoiceComposerView } from './voice';

/* The /composers showcase for Voice: picker glyph, scripted demo and comparison cells. */

/* ------------------------------------------------------------------ glyph, demo, spec */

const GLYPH_ORB: CSSProperties = { background: 'radial-gradient(circle at 35% 30%, oklch(1 0 0 / 0.9), var(--color-accent-400) 45%, var(--color-accent-500))' };

function VoiceGlyph() {
  const bar = 'absolute top-1/2 w-0.5 -translate-y-1/2 rounded-full bg-text-tertiary/50';
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute inset-x-0 top-1 h-6 rounded-full border border-border-button-default bg-background-primary-default" />
      <span className={cn(bar, 'left-[9px] h-1.5')} />
      <span className={cn(bar, 'left-[13px] h-3')} />
      <span className={cn(bar, 'left-[17px] h-2')} />
      <span className={cn(bar, 'right-[17px] h-2')} />
      <span className={cn(bar, 'right-[13px] h-3')} />
      <span className={cn(bar, 'right-[9px] h-1.5')} />
      <span className="absolute top-1/2 left-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/20" />
      <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={GLYPH_ORB} />
    </span>
  );
}

const intro: Script = async (api) => {
  await api.sleep(500);
  await api.user('What can I cook tonight with eggs, spinach and a bit of feta?', { type: true });
  const a = api.assistant();
  await a.think('Thinking', ['Matching what is in the fridge', 'Keeping it under 20 minutes'], 550);
  await a.stream(
    `A **spinach and feta frittata** works well, about 15 minutes:

1. Wilt two handfuls of spinach in an oven-safe pan with a little oil.
2. Pour in 6 beaten eggs, crumble the feta on top, cook 4 minutes on the hob.
3. Finish 6 to 8 minutes under the grill until it puffs and sets.

Hold the orb again if you want a side to go with it.`,
    26,
  );
  a.done();
};

const MicNote = () => (
  <span className="flex items-center gap-1">
    <Mic /> Hold Space to talk
  </span>
);

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;
const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex h-5 shrink-0 items-center rounded-[5px] border border-violet-500/20 bg-violet-500/10 px-1.5 text-caption-1-medium whitespace-nowrap text-violet-700 dark:text-violet-400">{children}</span>
);

export const voice: ComposerExtension = {
  Component: VoiceComposerView,
  Glyph: VoiceGlyph,
  demo: {
    intro,
    suggestions: ['What side goes with it?', 'Make it dairy-free', 'Read me the steps again'],
    content: ({ picker, count }) => ({
      model: picker,
      placeholder: 'Type instead',
      status: (
        <>
          <MicNote />
          <span className="tabular-nums">{count ? `${count} messages` : 'Voice stays on this device'}</span>
        </>
      ),
    }),
  },
  compare: {
    Input: 'Push-to-talk orb, textarea on demand',
    'Shift+Enter newline': <span className="flex items-center gap-1">{YES} keyboard mode</span>,
    'Model slot': 'Right of the orb',
    'Tools slot': 'Row under the composer',
    'Built-in tools': 'Add, keyboard toggle, orb',
    'Status placement': 'Under',
    Modes: <Tag>Voice / keyboard</Tag>,
    'Slash commands': NO,
    'Busy indicator': 'Orb thinking / speaking',
    'Stop control': 'Stop button, tap the orb',
    'Esc to stop': YES,
    'Best width': 'Any; built for mobile',
  },
};
