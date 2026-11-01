/** One user turn on the rail. `id` is the message's stable id, never its index. */
export type ThreadNavigatorItem = {
  id: string;
  /** The user request, clamped to two lines in the preview. */
  label: string;
  /** Assistant excerpt, clamped to four lines. Omitted while that answer has no text yet. */
  preview?: string;
  /** Short source labels. The rail shows them only when the list is non-empty. */
  references?: string[];
};

export type ThreadNavigatorProps = {
  items: readonly ThreadNavigatorItem[];
  /** Turn currently in view. The rail does not infer this from the DOM. */
  activeId?: string;
  onNavigate: (id: string) => void;
  /** Ids of bookmarked turns. Presence is controlled by the parent. */
  bookmarks?: readonly string[];
  /** When omitted, the preview has no bookmark control. */
  onBookmark?: (id: string) => void;
  className?: string;
  /** Accessible name of the rail. */
  label?: string;
};
