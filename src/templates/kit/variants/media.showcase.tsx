import { Image as ImageIcon } from 'lucide-react';
import type { ChatScriptApi, Script } from '../engine';
import type { ComposerExtension } from '../variant-types';

import { MediaComposerView, withFlags } from './media';
import { copyOf, defineCopy } from '../i18n';

/* The /composers showcase for Media: picker glyph, scripted demo and comparison cells. */

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

const COPY = defineCopy({
  en: {
    introPrompt: 'a koi pond at dawn, mist over the water, soft film grain',
    thinking: 'Composing',
    readParams: 'Reading the prompt and its parameters',
    planning: (n: number, ar: string) => `Planning ${n} variation${n > 1 ? 's' : ''} at ${ar}`,
    images: (n: number) => `${n} image${n > 1 ? 's' : ''}`,
    toolOutput: (n: number) => ['seed 4127 · sampling 30 steps', `${n} preview${n > 1 ? 's' : ''} ready`],
    answer: (n: number, ar: string) => `Here ${n > 1 ? `are **${n} variations**` : 'is **one image**'} at **${ar}**.

- **U1–U${n}** upscales one; **V1–V${n}** riffs on it.
- Raise **Stylize** for a more painterly look, or **Chaos** for a wilder spread across the grid.`,
    suggestions: ['a lighthouse in a storm, oil painting', 'isometric tiny bakery, soft clay render', 'portrait of a red fox in snow'],
    placeholder: 'Describe the image you want',
    dropRefs: 'Drop images as references',
    messages: (n: number) => `${n} messages`,
    flagsSent: 'Parameters are sent as flags',
    flagsTag: '--flags on send',
    compare: {
      input: 'Growing textarea + reference strip',
      model: 'Settings row, right',
      tools: 'After the parameter chips',
      builtIn: 'References, ratio, stylize/chaos, style, batch',
      status: 'Under',
      busy: 'Stop button',
      stop: 'Stop button',
      width: 'Main column (chips scroll when narrow)',
    },
  },
  fr: {
    introPrompt: 'un étang de carpes koï à l\'aube, brume sur l\'eau, grain de pellicule doux',
    thinking: 'Composition',
    readParams: 'Lecture du prompt et de ses paramètres',
    planning: (n: number, ar: string) => `Préparation de ${n} variation${n > 1 ? 's' : ''} en ${ar}`,
    images: (n: number) => `${n} image${n > 1 ? 's' : ''}`,
    toolOutput: (n: number) => ['seed 4127 · échantillonnage en 30 étapes', `${n} aperçu${n > 1 ? 's' : ''} prêt${n > 1 ? 's' : ''}`],
    answer: (n: number, ar: string) => `Voici ${n > 1 ? `**${n} variations**` : '**une image**'} en **${ar}**.

- **U1–U${n}** agrandit une image ; **V1–V${n}** en propose une variante.
- Augmentez **Stylisation** pour un rendu plus pictural, ou **Chaos** pour un éventail plus sauvage dans la grille.`,
    suggestions: ['un phare dans la tempête, peinture à l\'huile', 'minuscule boulangerie isométrique, rendu argile douce', 'portrait d\'un renard roux dans la neige'],
    placeholder: 'Décrivez l\'image souhaitée',
    dropRefs: 'Déposez des images comme références',
    messages: (n: number) => `${n} messages`,
    flagsSent: 'Les paramètres sont envoyés sous forme de flags',
    flagsTag: '--flags à l\'envoi',
    compare: {
      input: 'Zone de texte extensible + bandeau de références',
      model: 'Rangée de réglages, à droite',
      tools: 'Après les pastilles de paramètres',
      builtIn: 'Références, format, stylisation/chaos, style, lot',
      status: 'En dessous',
      busy: 'Bouton Stop',
      stop: 'Bouton Stop',
      width: 'Colonne principale (les pastilles défilent si étroit)',
    },
  },
});

const intro: Script = async (api) => {
  const prompt = copyOf(COPY).introPrompt;
  await api.sleep(500);
  // Type the prompt only; the flags arrive with the message, as the composer appends them on send.
  for (let i = 1; i <= prompt.length; i += 2) {
    api.setDraft(prompt.slice(0, i));
    await api.sleep(28);
  }
  api.setDraft(prompt);
  await api.sleep(350);
  api.setDraft('');
  await api.user(withFlags(prompt, { ar: '16:9', stylize: 250, chaos: 10, style: 'photo', n: 4 }));
  await generate(api, prompt, 4, '16:9');
};

async function generate(api: ChatScriptApi, prompt: string, n: number, ar: string) {
  const t = copyOf(COPY);
  const a = api.assistant();
  await a.think(t.thinking, [t.readParams, t.planning(n, ar)], 550);
  await a.tool('Generate', prompt.length > 48 ? `${prompt.slice(0, 47)}…` : prompt, { meta: `${t.images(n)} · ${ar}`, ms: 1400, output: t.toolOutput(n) });
  await a.stream(t.answer(n, ar), 26);
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const prompt = text.split(' --')[0].trim() || text;
  const n = Number(/--n (\d+)/.exec(text)?.[1] ?? 4);
  const ar = /--ar (\S+)/.exec(text)?.[1] ?? '1:1';
  await generate(api, prompt, n, ar);
}

/* ------------------------------------------------------------------ extension */

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;

export const media: ComposerExtension = {
  Component: MediaComposerView,
  Glyph: MediaGlyph,
  demo: {
    intro,
    reply,
    get suggestions() {
      return copyOf(COPY).suggestions;
    },
    content: ({ picker, count }) => {
      const t = copyOf(COPY);
      return {
        placeholder: t.placeholder,
        model: picker,
        status: (
          <>
            <span className="flex items-center gap-1">
              <ImageIcon /> {t.dropRefs}
            </span>
            <span className="tabular-nums">{count ? t.messages(count) : t.flagsSent}</span>
          </>
        ),
      };
    },
  },
  get compare() {
    const c = copyOf(COPY).compare;
    return {
      Input: c.input,
      'Shift+Enter newline': YES,
      'Model slot': c.model,
      'Tools slot': c.tools,
      'Built-in tools': c.builtIn,
      'Status placement': c.status,
      Modes: <span className="text-text-tertiary">—</span>,
      'Slash commands': <span className="inline-flex h-5 items-center rounded-full bg-sky-500/10 px-2 text-caption-1-medium text-sky-600 dark:text-sky-400">{copyOf(COPY).flagsTag}</span>,
      'Busy indicator': c.busy,
      'Stop control': c.stop,
      'Esc to stop': YES,
      'Best width': c.width,
    };
  },
};
