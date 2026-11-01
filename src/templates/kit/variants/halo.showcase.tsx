import { Sparkles } from 'lucide-react';
import type { ComposerExtension, DemoContext } from '../variant-types';
import type { Script } from '../engine';
import { copyOf, defineCopy } from '../i18n';

import { HaloComposerView } from './halo';

/* The /composers showcase for Halo: picker glyph, scripted demo and comparison cells. */

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

const COPY = defineCopy({
  en: {
    prompt: 'Plan a 3-day trip to Kyoto in autumn. Context: first visit, I like quiet temples and good food. Format: one line per day, then two tips.',
    thinking: 'Thinking',
    steps: ['Picking the autumn-leaf spots', 'Balancing temples with food stops'],
    answer: `A calm first visit, one district per day:

- **Day 1 · East** — Kiyomizu-dera at opening time, then the lanes of Sannenzaka and dinner in Gion.
- **Day 2 · North** — Eikan-dō and the Philosopher's Path, lunch near Ginkaku-ji, tofu at Nanzen-ji.
- **Day 3 · West** — Arashiyama bamboo early, Tenryū-ji gardens, and Nishiki Market on the way back.

Two tips: book a **kaiseki** dinner a week ahead, and use a day bus pass to save on short hops.`,
    placeholder: 'Ask anything',
    enhanceNote: 'Enhance turns a draft into a full prompt',
    messages: (n: number) => `${n} messages`,
    cycle: 'Examples cycle while empty',
    suggestions: ['Make it a 5-day trip', 'Where should I stay?', 'Enhance: what to pack'],
    compare: {
      input: 'Growing textarea',
      model: 'Action row, right',
      tools: 'After Enhance',
      builtIn: 'Add, Enhance',
      status: 'Under',
      busy: 'Glow up',
      stop: 'Stop button',
      width: 'Hero / empty state',
    },
  },
  fr: {
    prompt: 'Planifie trois jours à Kyoto en automne. Contexte : première visite, j\'aime les temples calmes et la bonne cuisine. Format : une ligne par jour, puis deux conseils.',
    thinking: 'Réflexion',
    steps: ['Choix des plus beaux spots d\'automne', 'Équilibre entre temples et pauses gourmandes'],
    answer: `Une première visite tranquille, un quartier par jour :

- **Jour 1 · Est**: Kiyomizu-dera à l'ouverture, puis les ruelles de Sannenzaka et dîner à Gion.
- **Jour 2 · Nord**: Eikan-dō et le Chemin de la philosophie, déjeuner près du Ginkaku-ji, tofu au Nanzen-ji.
- **Jour 3 · Ouest**: Bambouseraie d'Arashiyama tôt le matin, jardins du Tenryū-ji, puis marché Nishiki au retour.

Deux conseils : réservez un dîner **kaiseki** une semaine à l'avance, et prenez un pass bus à la journée pour les petits trajets.`,
    placeholder: 'Posez votre question',
    enhanceNote: 'Améliorer transforme un brouillon en prompt complet',
    messages: (n: number) => `${n} messages`,
    cycle: 'Les exemples défilent tant que le champ est vide',
    suggestions: ['Passe à 5 jours', 'Où loger ?', 'Améliorer : que mettre dans la valise'],
    compare: {
      input: 'Zone de texte extensible',
      model: "Rangée d'actions, à droite",
      tools: 'Après Améliorer',
      builtIn: 'Ajout, Améliorer',
      status: 'En dessous',
      busy: 'Le halo s\'intensifie',
      stop: 'Bouton Stop',
      width: 'Héros / état vide',
    },
  },
});

const intro: Script = async (api) => {
  const t = copyOf(COPY);
  await api.sleep(1800);
  await api.user(t.prompt, { type: true });
  const a = api.assistant();
  await a.think(t.thinking, t.steps, 600);
  await a.stream(t.answer, 26);
  a.done();
};

const content = ({ picker, count }: DemoContext) => {
  const t = copyOf(COPY);
  return {
    placeholder: t.placeholder,
    model: picker,
    status: (
      <>
        <span className="flex items-center gap-1">
          <Sparkles /> {t.enhanceNote}
        </span>
        <span className="tabular-nums">{count ? t.messages(count) : t.cycle}</span>
      </>
    ),
  };
};

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

export const halo: ComposerExtension = {
  Component: HaloComposerView,
  Glyph: HaloGlyph,
  demo: {
    intro,
    get suggestions() {
      return copyOf(COPY).suggestions;
    },
    content,
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
      Modes: NO,
      'Slash commands': NO,
      'Busy indicator': c.busy,
      'Stop control': c.stop,
      'Esc to stop': YES,
      'Best width': c.width,
    };
  },
};
