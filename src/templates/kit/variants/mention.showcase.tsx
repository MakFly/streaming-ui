import { AtSign } from 'lucide-react';
import type { ComposerExtension } from '../variant-types';

import { MentionComposerView, renderMentions } from './mention';
import { copyOf, defineCopy } from '../i18n';

/* The /composers showcase for Mention: picker glyph, scripted demo and comparison cells. */

/* ------------------------------------------------------------------ glyph, demo, spec */

function MentionGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default" />
      <span className="absolute top-[9px] left-2 h-0.5 w-2.5 rounded bg-text-tertiary/50" />
      <span className="absolute top-1.5 left-[22px] h-2 w-4 rounded-[3px] bg-sky-500/25 ring-1 ring-sky-500/50" />
      <span className="absolute top-[9px] left-[42px] h-0.5 w-1.5 rounded bg-text-tertiary/50" />
      <span className="absolute bottom-1.5 left-1.5 size-2 rounded-full bg-background-tertiary-default" />
      <span className="absolute bottom-[5px] left-[13px] font-mono text-[8px] leading-none text-text-tertiary">@</span>
      <span className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-text-primary" />
    </span>
  );
}

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

const COPY = defineCopy({
  en: {
    prompt: 'Review @app.tsx with @Ana before release, and check @schema.sql for risky migrations',
    thinking: 'Thinking',
    steps: ['Opening the mentioned files', 'Noting what Ana should look at'],
    lines: (n: number) => `${n} lines`,
    answer: `Two things to settle before release:

- @app.tsx: the new onboarding route skips the auth guard. Worth a look with @Ana, since it changes the first screen people see.
- @schema.sql: \`ALTER TABLE orders DROP COLUMN legacy_ref\` is not reversible. Ship it behind a backup, or split it into its own release.

Everything else reads as safe.`,
    suggestions: ['Loop in @Léo on the migration', 'Check @Linear for open release bugs', 'Summarize @README.md'],
    placeholder: 'Type @ to mention a file, person or source',
    filesPeople: 'Files, people, sources',
    messages: (n: number) => `${n} messages`,
    travel: 'Mentions travel as context',
    compare: {
      input: 'Rich text with @ chips',
      model: 'Action row, right',
      tools: 'After the @ button',
      builtIn: 'Add, mention menu',
      status: 'Under',
      busy: 'Stop button',
      stop: 'Stop button',
      width: 'Thread column',
    },
  },
  fr: {
    prompt: 'Relis @app.tsx avec @Ana avant la release, et vérifie @schema.sql pour les migrations risquées',
    thinking: 'Réflexion',
    steps: ['Ouverture des fichiers mentionnés', 'Note de ce que Ana doit regarder'],
    lines: (n: number) => `${n} lignes`,
    answer: `Deux points à régler avant la release :

- @app.tsx : la nouvelle route d'onboarding contourne la garde d'authentification. À regarder avec @Ana, puisque ça change le premier écran que voient les gens.
- @schema.sql : \`ALTER TABLE orders DROP COLUMN legacy_ref\` n'est pas réversible. Livrez-le derrière une sauvegarde, ou isolez-le dans sa propre release.

Le reste me paraît sûr.`,
    suggestions: ['Mets @Léo dans la boucle sur la migration', 'Regarde @Linear pour les bugs de release ouverts', 'Résume @README.md'],
    placeholder: 'Tapez @ pour mentionner un fichier, une personne ou une source',
    filesPeople: 'Fichiers, personnes, sources',
    messages: (n: number) => `${n} messages`,
    travel: 'Les mentions voyagent comme contexte',
    compare: {
      input: 'Texte riche avec pastilles @',
      model: "Rangée d'actions, à droite",
      tools: 'Après le bouton @',
      builtIn: 'Ajout, menu de mentions',
      status: 'En dessous',
      busy: 'Bouton Stop',
      stop: 'Bouton Stop',
      width: 'Colonne du fil',
    },
  },
});

export const mention: ComposerExtension = {
  Component: MentionComposerView,
  Glyph: MentionGlyph,
  demo: {
    async intro(api) {
      const t = copyOf(COPY);
      await api.sleep(500);
      await api.user(t.prompt, { type: true });
      const a = api.assistant();
      await a.think(t.thinking, t.steps, 550);
      await a.tool('Read', 'src/app.tsx', { meta: t.lines(212), ms: 700 });
      await a.tool('Read', 'db/schema.sql', { meta: t.lines(96), ms: 700 });
      await a.stream(t.answer, 26);
      a.done();
    },
    renderText: renderMentions,
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
              <AtSign /> {t.filesPeople}
            </span>
            <span className="tabular-nums">{count ? t.messages(count) : t.travel}</span>
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
      Modes: NO,
      'Slash commands': NO,
      'Busy indicator': c.busy,
      'Stop control': c.stop,
      'Esc to stop': YES,
      'Best width': c.width,
    };
  },
};
