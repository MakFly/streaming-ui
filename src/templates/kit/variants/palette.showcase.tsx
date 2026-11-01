import { type ReactNode } from 'react';
import { Command } from 'lucide-react';
import type { ComposerExtension } from '../variant-types';

import { PaletteComposerView } from './palette';
import { copyOf, defineCopy } from '../i18n';

/* The /composers showcase for Palette: picker glyph, scripted demo and comparison cells. */

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

const COPY = defineCopy({
  en: {
    prompt: 'Fix grammar: their going to announce the new pricing tommorow, so lets wait',
    thinking: 'Proofreading',
    steps: ['Spotting spelling and agreement errors'],
    answer: `> **They're** going to announce the new pricing **tomorrow**, so **let's** wait.

- *their* → **they're** (they are)
- *tommorow* → **tomorrow**
- *lets* → **let's** (let us)`,
    suggestions: ['Translate to French', 'Draft a reply to the team', 'Summarize thread'],
    placeholder: 'Ask AI or search commands…',
    kForActions: 'K for actions',
    messages: (n: number) => `${n} messages`,
    tabHands: 'Tab hands the query to AI',
    tag: '5 commands, no slash',
    compare: {
      input: 'Single-line search',
      model: 'Search row, right',
      tools: 'Row under the palette',
      builtIn: 'Commands, recents, attach (⌘K)',
      status: 'Under',
      busy: 'List folds, Stop button',
      stop: 'Stop button + esc chip',
      width: 'Centred overlay, 560–720px',
    },
  },
  fr: {
    prompt: 'Corriger la grammaire : ils vont annoncé les nouveaux tarifs demin, donc on attends',
    thinking: 'Relecture',
    steps: ["Repérage des fautes d'orthographe et d'accord"],
    answer: `> Ils vont **annoncer** les nouveaux tarifs **demain**, donc on **attend**.

- *annoncé* → **annoncer** (infinitif après « aller »)
- *demin* → **demain**
- *attends* → **attend** (« on » prend la terminaison de la 3e personne)`,
    suggestions: ['Traduire en anglais', "Rédiger une réponse à l'équipe", 'Résumer le fil'],
    placeholder: 'Demandez à l\'IA ou cherchez une commande…',
    kForActions: 'K pour les actions',
    messages: (n: number) => `${n} messages`,
    tabHands: "Tab passe la requête à l'IA",
    tag: '5 commandes, sans slash',
    compare: {
      input: 'Recherche sur une ligne',
      model: 'Ligne de recherche, à droite',
      tools: 'Rangée sous la palette',
      builtIn: 'Commandes, récents, joindre (⌘K)',
      status: 'En dessous',
      busy: 'La liste se replie, bouton Stop',
      stop: 'Bouton Stop + pastille échap',
      width: 'Surcouche centrée, 560 à 720 px',
    },
  },
});

const intro: ComposerExtension['demo']['intro'] = async (api) => {
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
const Tag = ({ children }: { children: ReactNode }) => <span className="inline-flex h-5 items-center rounded-md bg-accent-500/10 px-1.5 text-caption-1-medium text-accent-500">{children}</span>;

export const palette: ComposerExtension = {
  Component: PaletteComposerView,
  Glyph: PaletteGlyph,
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
            <span className="flex items-center gap-1">
              <Command /> {t.kForActions}
            </span>
            <span className="tabular-nums">{count ? t.messages(count) : t.tabHands}</span>
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
      'Shift+Enter newline': NO,
      'Model slot': c.model,
      'Tools slot': c.tools,
      'Built-in tools': c.builtIn,
      'Status placement': c.status,
      Modes: NO,
      'Slash commands': <Tag>{t.tag}</Tag>,
      'Busy indicator': c.busy,
      'Stop control': c.stop,
      'Esc to stop': YES,
      'Best width': c.width,
    };
  },
};
