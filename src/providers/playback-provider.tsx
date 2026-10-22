import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface Playback {
  /** Replay each demo ~3.8s after it finishes. */
  loop: boolean;
  setLoop: (loop: boolean) => void;
  /** Bumped by "Replay all": every on-screen stage restarts when it changes. */
  replayToken: number;
  replayAll: () => void;
}

const PlaybackContext = createContext<Playback | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [loop, setLoop] = useState(true);
  const [replayToken, setReplayToken] = useState(0);
  const replayAll = useCallback(() => setReplayToken((n) => n + 1), []);
  const value = useMemo(() => ({ loop, setLoop, replayToken, replayAll }), [loop, replayToken, replayAll]);
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside <PlaybackProvider>');
  return ctx;
}
