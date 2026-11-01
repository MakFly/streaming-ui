import { type ReactNode } from 'react';
import type { ComposerExtension, CompareRow } from '../variant-types';
import type { Script } from '../engine';
import { copyOf, defineCopy } from '../i18n';

import { InlineComposerView } from './inline';

/* The /composers showcase for Inline: picker glyph, scripted demo and comparison cells. */

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

const COPY = defineCopy({
  en: {
    prompt: 'Rewrite “we will try to ship it soon, hopefully” so it sounds confident',
    thinking: 'Editing',
    steps: ['Reading the selected sentence', 'Keeping the meaning, dropping the hedges'],
    answer: `Suggested edit:

> ~~we will try to ship it soon, hopefully~~
> **We ship it on Thursday.**

- Dropped *try* and *hopefully*: they promise less than you mean.
- A day beats *soon*; swap in the real date before you send it.

Press **Tab** to accept, or select another sentence and **⌘K** again.`,
    placeholder: 'Select text, then ⌘K to edit it',
    selectFirst: 'Select any text in the thread first',
    messages: (n: number) => `${n} messages`,
    inline: 'Edits stay inline',
    suggestions: ['Make it even shorter', 'Ask why it works', 'Try a friendlier tone'],
    compare: {
      input: 'Single line + selection chip',
      model: 'In the bar, small (sm and up)',
      tools: 'Row under the bar',
      builtIn: 'Selection chip, attach',
      status: 'Under',
      modes: 'Edit / Ask segment',
      busy: 'Spinner glyph',
      stop: 'Stop button, esc hint',
      width: 'Narrow, over content',
    },
  },
  fr: {
    prompt: 'Réécris « on va essayer de livrer ça bientôt, j\'espère » pour que ça sonne assuré',
    thinking: 'Modification',
    steps: ['Lecture de la phrase sélectionnée', 'Le sens est conservé, les précautions oratoires disparaissent'],
    answer: `Modification suggérée :

> ~~on va essayer de livrer ça bientôt, j'espère~~
> **On livre jeudi.**

- *Essayer* et *j'espère* ont disparu : ils promettent moins que ce que vous voulez dire.
- Un jour précis vaut mieux que *bientôt* ; mettez la vraie date avant d'envoyer.

Appuyez sur **Tab** pour accepter, ou sélectionnez une autre phrase et refaites **⌘K**.`,
    placeholder: 'Sélectionnez du texte, puis ⌘K pour le modifier',
    selectFirst: 'Sélectionnez d\'abord du texte dans le fil',
    messages: (n: number) => `${n} messages`,
    inline: 'Les modifications restent en ligne',
    suggestions: ['Fais encore plus court', 'Demande pourquoi ça marche', 'Essaie un ton plus amical'],
    compare: {
      input: 'Une ligne + pastille de sélection',
      model: 'Dans la barre, petit (sm et plus)',
      tools: 'Rangée sous la barre',
      builtIn: 'Pastille de sélection, joindre',
      status: 'En dessous',
      modes: 'Segment Modifier / Demander',
      busy: 'Icône de chargement',
      stop: 'Bouton Stop, indice échap',
      width: 'Étroit, par-dessus le contenu',
    },
  },
});

const intro: Script = async (api) => {
  const t = copyOf(COPY);
  await api.sleep(500);
  await api.user(t.prompt, { type: true });
  const a = api.assistant();
  await a.think(t.thinking, t.steps, 550);
  await a.stream(t.answer, 26);
  a.done();
};

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

const compare = (): Record<CompareRow, ReactNode> => {
  const c = copyOf(COPY).compare;
  return {
    Input: c.input,
    'Shift+Enter newline': NO,
    'Model slot': c.model,
    'Tools slot': c.tools,
    'Built-in tools': c.builtIn,
    'Status placement': c.status,
    Modes: c.modes,
    'Slash commands': NO,
    'Busy indicator': c.busy,
    'Stop control': c.stop,
    'Esc to stop': YES,
    'Best width': c.width,
  };
};

export const inline: ComposerExtension = {
  Component: InlineComposerView,
  Glyph: InlineGlyph,
  demo: {
    intro,
    get suggestions() {
      return copyOf(COPY).suggestions;
    },
    content: ({ picker, count }) => {
      const t = copyOf(COPY);
      return {
        model: picker,
        placeholder: t.placeholder,
        status: (
          <>
            <span>{t.selectFirst}</span>
            <span className="tabular-nums">{count ? t.messages(count) : t.inline}</span>
          </>
        ),
      };
    },
  },
  get compare() {
    return compare();
  },
};
