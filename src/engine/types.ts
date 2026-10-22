/** Timer scope handed to every demo: everything it schedules dies with clear(). */
export interface Timers {
  readonly dead: boolean;
  sleep(ms: number): Promise<void>;
  every(ms: number, fn: () => void): ReturnType<typeof setInterval>;
  stop(id: ReturnType<typeof setTimeout>): void;
  clear(): void;
}

/** Per-stage object that survives replays; restart() replays the demo. */
export type DemoContext = { restart?: () => void } & Record<string, unknown>;

export type DemoKind = 'lib' | 'chat' | 'scene';

/** A demo as written by the engine modules (imperative, DOM-based). */
export interface DemoSource {
  group: string;
  title: string;
  desc: string;
  src?: string;
  kind?: DemoKind;
  registry?: string[];
  run(root: HTMLElement, t: Timers, ctx: DemoContext): Promise<void> | void;
}

/** A demo once registered: numbered and addressable by URL. */
export interface Demo extends DemoSource {
  index: number;
  slug: string;
  library: Library;
}

export interface Library {
  name: string;
  slug: string;
  count: number;
}
