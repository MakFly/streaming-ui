import { Image as ImageIcon } from 'lucide-react';
import type { ChatScriptApi, Script } from '../engine';
import type { ComposerExtension } from '../variant-types';

import { MediaComposerView, withFlags } from './media';

/* The /composers showcase for Media: picker glyph, scripted demo, spec sheet and comparison cells. */

/* ------------------------------------------------------------------ glyph */

function MediaGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default" />
      <span className="absolute top-1.5 left-1.5 size-3 rounded-[3px] bg-gradient-to-br from-amber-300 via-rose-400 to-indigo-500" />
      <span className="absolute top-2 left-[18px] h-0.5 w-6 rounded bg-text-tertiary/50" />
      <span className="absolute top-3 left-[18px] h-0.5 w-4 rounded bg-text-tertiary/30" />
      <span className="absolute bottom-1.5 left-1.5 h-1.5 w-2.5 rounded-full border border-text-tertiary/50" />
      <span className="absolute bottom-1.5 left-[14px] h-1.5 w-3 rounded-full border border-text-tertiary/50" />
      <span className="absolute bottom-1.5 left-[28px] h-1.5 w-2 rounded-full bg-background-tertiary-default" />
      <span className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-text-primary" />
    </span>
  );
}

/* ------------------------------------------------------------------ demo */

const INTRO_PROMPT = 'a koi pond at dawn, mist over the water, soft film grain';

const intro: Script = async (api) => {
  await api.sleep(500);
  // Type the prompt only; the flags arrive with the message, as the composer appends them on send.
  for (let i = 1; i <= INTRO_PROMPT.length; i += 2) {
    api.setDraft(INTRO_PROMPT.slice(0, i));
    await api.sleep(28);
  }
  api.setDraft(INTRO_PROMPT);
  await api.sleep(350);
  api.setDraft('');
  await api.user(withFlags(INTRO_PROMPT, { ar: '16:9', stylize: 250, chaos: 10, style: 'photo', n: 4 }));
  await generate(api, INTRO_PROMPT, 4, '16:9');
};

async function generate(api: ChatScriptApi, prompt: string, n: number, ar: string) {
  const a = api.assistant();
  await a.think('Composing', ['Reading the prompt and its parameters', `Planning ${n} variation${n > 1 ? 's' : ''} at ${ar}`], 550);
  await a.tool('Generate', prompt.length > 48 ? `${prompt.slice(0, 47)}…` : prompt, { meta: `${n} image${n > 1 ? 's' : ''} · ${ar}`, ms: 1400, output: ['seed 4127 · sampling 30 steps', `${n} preview${n > 1 ? 's' : ''} ready`] });
  await a.stream(
    `Here ${n > 1 ? `are **${n} variations**` : 'is **one image**'} at **${ar}**.

- **U1–U${n}** upscales one; **V1–V${n}** riffs on it.
- Raise **Stylize** for a more painterly look, or **Chaos** for a wilder spread across the grid.`,
    26,
  );
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const prompt = text.split(' --')[0].trim() || text;
  const n = Number(/--n (\d+)/.exec(text)?.[1] ?? 4);
  const ar = /--ar (\S+)/.exec(text)?.[1] ?? '1:1';
  await generate(api, prompt, n, ar);
}

/* ------------------------------------------------------------------ extension */

export const media: ComposerExtension = {
  Component: MediaComposerView,
  Glyph: MediaGlyph,
  demo: {
    intro,
    reply,
    suggestions: ['a lighthouse in a storm, oil painting', 'isometric tiny bakery, soft clay render', 'portrait of a red fox in snow'],
    content: ({ picker, count }) => ({
      placeholder: 'Describe the image you want',
      model: picker,
      status: (
        <>
          <span className="flex items-center gap-1">
            <ImageIcon /> Drop images as references
          </span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Parameters are sent as flags'}</span>
        </>
      ),
    }),
  },
  spec: {
    anatomy: [
      'Reference strip above the prompt (Composer Attachments: 56px tiles, upload ring), drop target on the card',
      'Growing textarea',
      'Aspect-ratio chip: grid of six ratio boxes drawn to scale',
      'Stylize chip: Stylize and Chaos sliders',
      'Style chip: Auto, Photo, Illustration, 3D, Anime swatches',
      'Batch segmented ×1 / ×2 / ×4',
      'Tools slot after the chips',
      'Model slot + Send / Stop',
      'Status line under the card',
    ],
    behaviour: [
      { keys: ['Enter'], text: 'sends the prompt with its flags appended (--ar --stylize --chaos --style --n)' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Esc'], text: 'stops while busy; inside a chip popover it closes the popover first' },
      { keys: null, text: 'Busy: Send turns into Stop. Dropping images over the card shows a dashed target and queues one reference per image into the attachment strip.' },
    ],
    bestFor: 'Image and media generation, where every prompt carries a handful of render parameters that should stay visible.',
    usage: `<Composer
  variant="media"
  value={draft}
  onChange={setDraft}
  // receives "a koi pond at dawn --ar 16:9 --stylize 250 --chaos 10 --style photo --n 4"
  onSend={generate}
  onStop={stop}
  busy={busy}
  placeholder="Describe the image you want"
  model={<ModelPicker value={model} onChange={setModel} />}
  status={
    <>
      <span><Image /> Drop images as references</span>
      <span>{credits} credits left</span>
    </>
  }
/>`,
  },
  compare: {
    Input: 'Growing textarea + reference strip',
    'Shift+Enter newline': <span className="text-emerald-600 dark:text-emerald-400">✓</span>,
    'Model slot': 'Settings row, right',
    'Tools slot': 'After the parameter chips',
    'Built-in tools': 'References, ratio, stylize/chaos, style, batch',
    'Status placement': 'Under',
    Modes: <span className="text-text-tertiary">—</span>,
    'Slash commands': <span className="inline-flex h-5 items-center rounded-full bg-sky-500/10 px-2 text-caption-1-medium text-sky-600 dark:text-sky-400">--flags on send</span>,
    'Busy indicator': 'Stop button',
    'Stop control': 'Stop button',
    'Esc to stop': <span className="text-emerald-600 dark:text-emerald-400">✓</span>,
    'Best width': 'Main column (chips scroll when narrow)',
  },
};
