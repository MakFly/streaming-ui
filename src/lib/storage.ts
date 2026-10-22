// localStorage can throw (private windows, blocked site data): every access goes through here.
export const storage = {
  get(key: string, fallback: string): string {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* not persisted */
    }
  },
};

export const STORAGE_KEYS = { theme: 'sui-theme', palette: 'sui-palette', view: 'sr-view' } as const;
