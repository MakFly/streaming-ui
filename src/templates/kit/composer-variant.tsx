import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { copyOf, defineCopy } from './i18n';

/* Which composer every template uses. `auto` keeps each template's own pick; any other value swaps the
 * composer everywhere. The choice is saved and shared like the theme: same-origin frames (the gallery's
 * live thumbnails, other tabs) follow it through the storage event, and `?composer=<id>` forces one. */

const COPY = defineCopy({
  en: {
    pill: { from: 'Single row', hint: 'One row: add, input, model, send' },
    box: { from: 'Textarea', hint: 'Growing textarea over an action row' },
    panel: { from: 'Rail', hint: 'Branch, project and context on a rail; attachments, permission mode' },
    dock: { from: 'Floating toolbar', hint: 'Floating glass toolbar with grouped tools' },
    command: { from: 'Terminal', hint: 'Monospace prompt, slash commands, key hints' },
    inline: { from: 'Selection bar', hint: 'Compact bar on a selection; edit or ask, Tab / Esc' },
    voice: { from: 'Voice orb', hint: 'Voice-reactive orb, push-to-talk, live transcript' },
    halo: { from: 'Glow rim', hint: 'Glowing rim, typed example prompts, enhance, vanish on send' },
    media: { from: 'Image prompt', hint: 'Prompt with aspect, sliders, style and batch' },
    palette: { from: 'Command palette', hint: 'Command palette that hands the query to AI on Tab' },
    mention: { from: 'Mentions', hint: '@ chips for files, people and sources in the text' },
  },
  fr: {
    pill: { from: 'Une seule ligne', hint: 'Une ligne : ajout, saisie, modèle, envoi' },
    box: { from: 'Zone de texte', hint: 'Zone de texte extensible au-dessus d\'une rangée d\'actions' },
    panel: { from: 'Rail', hint: 'Branche, projet et contexte sur un rail ; pièces jointes, mode de permission' },
    dock: { from: 'Barre flottante', hint: 'Barre d\'outils flottante en verre, outils groupés' },
    command: { from: 'Terminal', hint: 'Invite monospace, commandes slash, raccourcis clavier' },
    inline: { from: 'Barre de sélection', hint: 'Barre compacte sur une sélection ; modifier ou demander, Tab / Échap' },
    voice: { from: 'Orbe vocal', hint: 'Orbe réactif à la voix, appuyer pour parler, transcription en direct' },
    halo: { from: 'Halo lumineux', hint: 'Bord lumineux, exemples de prompts saisis, amélioration, disparition à l\'envoi' },
    media: { from: 'Prompt d\'image', hint: 'Prompt avec format, curseurs, style et lot' },
    palette: { from: 'Palette de commandes', hint: 'Palette de commandes qui passe la requête à l\'IA avec Tab' },
    mention: { from: 'Mentions', hint: 'Pastilles @ pour fichiers, personnes et sources dans le texte' },
  },
});

/* `from` and `hint` are getters so they follow the locale at the moment they are read. */
const variant = <I extends keyof (typeof COPY)['en']>(id: I, name: string) => ({
  id,
  name,
  get from(): string {
    return copyOf(COPY)[id].from;
  },
  get hint(): string {
    return copyOf(COPY)[id].hint;
  },
});

export const COMPOSER_VARIANTS = [
  variant('pill', 'Pill'),
  variant('box', 'Box'),
  variant('panel', 'Panel'),
  variant('dock', 'Dock'),
  variant('command', 'Command'),
  variant('inline', 'Inline'),
  variant('voice', 'Voice'),
  variant('halo', 'Halo'),
  variant('media', 'Media'),
  variant('palette', 'Palette'),
  variant('mention', 'Mention'),
] as const;

export type ComposerVariant = (typeof COMPOSER_VARIANTS)[number]['id'];
/** The five original composers (kit/composers.tsx); the rest live in kit/variants/. */
export type BaseVariant = 'pill' | 'box' | 'panel' | 'dock' | 'command';
export type ComposerChoice = ComposerVariant | 'auto';

const KEY = 'tpl-composer';
const isVariant = (v: string | null): v is ComposerVariant => COMPOSER_VARIANTS.some((x) => x.id === v);

const Ctx = createContext<{ choice: ComposerChoice; setChoice: (c: ComposerChoice) => void }>({ choice: 'auto', setChoice: () => {} });

export function ComposerVariantProvider({ children }: { children: ReactNode }) {
  // A forced `?composer=` wins for the life of the frame: a choice made in another tab must not replace it.
  const [forced] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('composer');
    return isVariant(param) ? param : null;
  });
  const [choice, setState] = useState<ComposerChoice>(() => {
    if (forced) return forced;
    const saved = storage.get(KEY, 'auto');
    return isVariant(saved) ? saved : 'auto';
  });

  useEffect(() => {
    if (forced) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(isVariant(e.newValue) ? e.newValue : 'auto');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [forced]);

  const setChoice = useCallback((c: ComposerChoice) => {
    setState(c);
    storage.set(KEY, c);
  }, []);

  const value = useMemo(() => ({ choice, setChoice }), [choice, setChoice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useComposerChoice = () => useContext(Ctx);

/** The variant a composer should render: the global pick, or the template's own default under `auto`. */
export function useComposerVariant(fallback: ComposerVariant = 'pill'): ComposerVariant {
  const { choice } = useContext(Ctx);
  return choice === 'auto' ? fallback : choice;
}
