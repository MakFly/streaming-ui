import { type CSSProperties, type ReactNode } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Script } from '../engine';
import type { ComposerExtension } from '../variant-types';

import { VoiceComposerView } from './voice';
import { copyOf, defineCopy, useCopy } from '../i18n';

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

const COPY = defineCopy({
  en: {
    prompt: 'What can I cook tonight with eggs, spinach and a bit of feta?',
    thinking: 'Thinking',
    steps: ['Matching what is in the fridge', 'Keeping it under 20 minutes'],
    answer: `A **spinach and feta frittata** works well, about 15 minutes:

1. Wilt two handfuls of spinach in an oven-safe pan with a little oil.
2. Pour in 6 beaten eggs, crumble the feta on top, cook 4 minutes on the hob.
3. Finish 6 to 8 minutes under the grill until it puffs and sets.

Hold the orb again if you want a side to go with it.`,
    holdSpace: 'Hold Space to talk',
    suggestions: ['What side goes with it?', 'Make it dairy-free', 'Read me the steps again'],
    placeholder: 'Type instead',
    messages: (n: number) => `${n} messages`,
    onDevice: 'Voice stays on this device',
    keyboardMode: 'keyboard mode',
    tag: 'Voice / keyboard',
    compare: {
      input: 'Push-to-talk orb, textarea on demand',
      model: 'Right of the orb',
      tools: 'Row under the composer',
      builtIn: 'Add, keyboard toggle, orb',
      status: 'Under',
      busy: 'Orb thinking / speaking',
      stop: 'Stop button, tap the orb',
      width: 'Any; built for mobile',
    },
  },
  fr: {
    prompt: 'Que puis-je cuisiner ce soir avec des œufs, des épinards et un peu de feta ?',
    thinking: 'Réflexion',
    steps: ['Je regarde ce qu\'il y a dans le frigo', 'Je reste sous 20 minutes'],
    answer: `Une **frittata aux épinards et à la feta** conviendrait bien, environ 15 minutes :

1. Faites tomber deux poignées d'épinards dans une poêle allant au four avec un peu d'huile.
2. Versez 6 œufs battus, émiettez la feta dessus, laissez cuire 4 minutes sur le feu.
3. Terminez 6 à 8 minutes sous le gril, jusqu'à ce que ça gonfle et prenne.

Maintenez à nouveau l'orbe si vous voulez un accompagnement.`,
    holdSpace: 'Maintenez Espace pour parler',
    suggestions: ['Quel accompagnement ?', 'Sans produits laitiers', 'Relis-moi les étapes'],
    placeholder: 'Écrire à la place',
    messages: (n: number) => `${n} messages`,
    onDevice: 'La voix reste sur cet appareil',
    keyboardMode: 'mode clavier',
    tag: 'Voix / clavier',
    compare: {
      input: 'Orbe à maintenir pour parler, zone de texte à la demande',
      model: "À droite de l'orbe",
      tools: 'Rangée sous le composer',
      builtIn: "Ajout, bascule clavier, orbe",
      status: 'En dessous',
      busy: "L'orbe réfléchit / parle",
      stop: "Bouton Stop, toucher l'orbe",
      width: 'Toutes ; pensé pour le mobile',
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

const MicNote = () => {
  const t = useCopy(COPY);
  return (
    <span className="flex items-center gap-1">
      <Mic /> {t.holdSpace}
    </span>
  );
};

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
            <MicNote />
            <span className="tabular-nums">{count ? t.messages(count) : t.onDevice}</span>
          </>
        ),
      };
    },
  },
  get compare() {
    const t = copyOf(COPY);
    const c = t.compare;
    return {
      Input: c.input,
      'Shift+Enter newline': <span className="flex items-center gap-1">{YES} {t.keyboardMode}</span>,
      'Model slot': c.model,
      'Tools slot': c.tools,
      'Built-in tools': c.builtIn,
      'Status placement': c.status,
      Modes: <Tag>{t.tag}</Tag>,
      'Slash commands': NO,
      'Busy indicator': c.busy,
      'Stop control': c.stop,
      'Esc to stop': YES,
      'Best width': c.width,
    };
  },
};
