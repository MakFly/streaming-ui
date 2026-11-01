import type { ReactNode } from 'react';

/** One agent taking part in the run. `avatar` is any node (an image, a mascot, an initial). */
export type AgentFeedAgent = {
  id: string;
  name: string;
  /** Shown after the name in a message row, dimmed ("Lead", "Reviewer"). */
  role?: string;
  avatar?: ReactNode;
};

/** A site behind a search result: its favicon URL, or an initial on a brand color. */
export type AgentFeedSource = { name: string; icon?: string; color?: string };

/** One beat of the run. `agent` is the id of whoever produced it. `id` must stay stable across renders. */
export type AgentFeedItem =
  | { id: string; kind: 'search'; query: string; results?: number; sources?: AgentFeedSource[]; agent?: string; pending?: boolean }
  | { id: string; kind: 'visit'; url: string; agent?: string }
  | { id: string; kind: 'message'; agent: string; text: string }
  | { id: string; kind: 'status'; text: string; agent?: string };

export type AgentFeedLabels = {
  searching: string;
  searched: string;
  visited: string;
  results: (n: number) => string;
};
