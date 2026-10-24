/* Single source of truth for the gallery: builds every demo once, in the legacy order
 * (core.js → libs.js → packs), and gives each one a stable URL slug. */
import { createCore } from './core.js';
import libDemos from './libs.js';
import streamMore from './packs/stream-more.js';
import chatAssistCards from './packs/chat-assist-cards.js';
import motionKit from './packs/motion-kit.js';
import textGlow from './packs/text-glow.js';
import research from './packs/research.js';
import blocksDotsAnimated from './packs/blocks-dots-animated.js';
import transitionsMore from './packs/transitions-more.js';
import agentOps from './packs/agent-ops.js';
import { slug } from './prompt.js';
import type { Demo, DemoSource, Library, Timers } from './types';

type PackFactory = (h: Record<string, unknown>) => DemoSource[];

const core = createCore();
// libs.js runs first: it adds its shared helpers (mdStream, disclosure, dotGrid…) onto H for the packs.
const sources: DemoSource[] = [...(core.demos as DemoSource[]), ...(libDemos(core.H) as DemoSource[])];
const PACKS: [string, PackFactory][] = [
  ['stream-more', streamMore],
  ['chat-assist-cards', chatAssistCards],
  ['motion-kit', motionKit],
  ['text-glow', textGlow],
  ['research', research],
  ['blocks-dots-animated', blocksDotsAnimated],
  ['transitions-more', transitionsMore],
  ['agent-ops', agentOps],
] as [string, PackFactory][];
for (const [name, pack] of PACKS) {
  try {
    sources.push(...(pack(core.H) || []));
  } catch (error) {
    console.error(`Demo pack "${name}" failed to load`, error);
  }
}

const libraryBySlug = new Map<string, Library>();
for (const d of sources) {
  const key = slug(d.group);
  const lib = libraryBySlug.get(key) ?? { name: d.group, slug: key, count: 0 };
  lib.count += 1;
  libraryBySlug.set(key, lib);
}

const taken = new Set<string>();
export const demos: Demo[] = sources.map((d, i) => {
  const base = `${slug(d.group)}-${slug(d.title)}`;
  let s = base;
  for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
  taken.add(s);
  return { ...d, index: i + 1, slug: s, library: libraryBySlug.get(slug(d.group))! };
});

export const libraries: Library[] = [...libraryBySlug.values()];

const demoBySlug = new Map(demos.map((d) => [d.slug, d]));
export const getDemo = (s: string | undefined) => (s ? demoBySlug.get(s) : undefined);
export const getLibrary = (s: string | undefined) => (s ? libraryBySlug.get(s) : undefined);

export const createTimers = core.timers as () => Timers;

/** Helpers and constants a demo's run() can reach — the Prompt builder inlines the ones it uses. */
export const promptRefs = { H: core.H, refs: core.refs, consts: core.consts };

export const searchText = (d: Demo) => `${d.title} ${d.group} ${d.desc} ${d.src || ''}`.toLowerCase();
