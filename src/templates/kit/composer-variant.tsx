import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';

/* Which composer every template uses. `auto` keeps each template's own pick; any other value swaps the
 * composer everywhere. The choice is saved and shared like the theme: same-origin frames (the gallery's
 * live thumbnails, other tabs) follow it through the storage event, and `?composer=<id>` forces one. */

export const COMPOSER_VARIANTS = [
  { id: 'pill', name: 'Pill', from: 'Single row', hint: 'One row: add, input, model, send' },
  { id: 'box', name: 'Box', from: 'Textarea', hint: 'Growing textarea over an action row' },
  { id: 'panel', name: 'Panel', from: 'Rail', hint: 'Branch, project and context on a rail; attachments, permission mode' },
  { id: 'dock', name: 'Dock', from: 'Floating toolbar', hint: 'Floating glass toolbar with grouped tools' },
  { id: 'command', name: 'Command', from: 'Terminal', hint: 'Monospace prompt, slash commands, key hints' },
  { id: 'inline', name: 'Inline', from: 'Selection bar', hint: 'Compact bar on a selection; edit or ask, Tab / Esc' },
  { id: 'voice', name: 'Voice', from: 'Voice orb', hint: 'Voice-reactive orb, push-to-talk, live transcript' },
  { id: 'halo', name: 'Halo', from: 'Glow rim', hint: 'Glowing rim, typed example prompts, enhance, vanish on send' },
  { id: 'media', name: 'Media', from: 'Image prompt', hint: 'Prompt with aspect, sliders, style and batch' },
  { id: 'palette', name: 'Palette', from: 'Command palette', hint: 'Command palette that hands the query to AI on Tab' },
  { id: 'mention', name: 'Mention', from: 'Mentions', hint: '@ chips for files, people and sources in the text' },
] as const;

export type ComposerVariant = (typeof COMPOSER_VARIANTS)[number]['id'];
/** The five original composers (kit/composers.tsx); the rest live in kit/variants/. */
export type BaseVariant = 'pill' | 'box' | 'panel' | 'dock' | 'command';
export type ComposerChoice = ComposerVariant | 'auto';

const KEY = 'tpl-composer';
const isVariant = (v: string | null): v is ComposerVariant => COMPOSER_VARIANTS.some((x) => x.id === v);

const Ctx = createContext<{ choice: ComposerChoice; setChoice: (c: ComposerChoice) => void }>({ choice: 'auto', setChoice: () => {} });

export function ComposerVariantProvider({ children }: { children: ReactNode }) {
  const [choice, setState] = useState<ComposerChoice>(() => {
    const forced = new URLSearchParams(window.location.search).get('composer');
    if (isVariant(forced)) return forced;
    const saved = storage.get(KEY, 'auto');
    return isVariant(saved) ? saved : 'auto';
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(isVariant(e.newValue) ? e.newValue : 'auto');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
