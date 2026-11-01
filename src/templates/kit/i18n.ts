import { useSyncExternalStore } from 'react';

/* Template i18n: every template and the shared kit carry their copy in English and French. The locale is one
 * value for the whole site, kept in localStorage and shared with every preview frame (the storage event), like
 * the theme. Components read their copy with useCopy (re-rendering on a switch); scripts, which run outside React,
 * read it with copyOf at the moment they run. */

export type Locale = 'en' | 'fr';
export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'fr', label: 'Français', short: 'FR' },
];

const KEY = 'sui-locale';
const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'fr';

function initial(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked: fall back to English */
  }
  return 'en';
}

let current: Locale = initial();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined')
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && isLocale(e.newValue) && e.newValue !== current) {
      current = e.newValue;
      emit();
    }
  });

export const getLocale = () => current;

export function setLocale(next: Locale) {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* storage blocked: the switch still applies to this page */
  }
  emit();
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => 'en',
  );
}

/** A piece of copy in every locale. `fr` must have exactly the shape of `en` (the compiler checks it). */
export type Copy<T> = { en: T; fr: T };
export const defineCopy = <T>(copy: Copy<T>) => copy;

/** In components: the copy for the current locale, re-rendering when it changes. */
export const useCopy = <T>(copy: Copy<T>): T => copy[useLocale()];

/** In scripts and other code outside React: the copy for the locale at the moment of the call. */
export const copyOf = <T>(copy: Copy<T>): T => copy[current];

/** Number and date formatting that follows the locale. */
export const intlLocale = (l: Locale = current) => (l === 'fr' ? 'fr-FR' : 'en-US');
